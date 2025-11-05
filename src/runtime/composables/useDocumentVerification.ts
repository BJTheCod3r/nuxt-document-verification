import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useNuxtApp } from '#app'
import { DocumentVerificationError } from './errors'
import type {
  Document,
  DocumentVerificationConfig,
  DocumentVerificationMessages,
  FieldDefinition,
  FieldType,
  ResolvedField,
} from './types'
import { HTTP_STATUS_CODE } from './types'
import { readId, readDisplayAsset, readStringField, readBooleanFlag } from './utils'
import {
  BASE_FIELD_DEFINITIONS,
  DEFAULT_DOCUMENT_ID_PARAM,
  NORMALIZED_FIELD_KEYS,
} from './constants'
import defaultMessages from './defaults/messages.json'

const FALLBACK_MESSAGES = defaultMessages as DocumentVerificationMessages
const DEFAULT_MISSING_CONFIG_ERROR = FALLBACK_MESSAGES.missingConfigError!

export const useDocumentVerification = () => {
  const { $documentVerification } = useNuxtApp()

  if (!$documentVerification) {
    throw new DocumentVerificationError('CONFIG', DEFAULT_MISSING_CONFIG_ERROR)
  }

  const cfg = $documentVerification as DocumentVerificationConfig
  const route = useRoute()
  const documentIdParam = cfg.documentIdParam || DEFAULT_DOCUMENT_ID_PARAM
  const showBackLink = cfg.showBackLink ?? true
  const showDocument = cfg.showDocument ?? true
  const displayTitle = cfg.displayTitle ?? 'Document Preview'
  const showDocumentTitle = cfg.showDocumentTitle ?? true
  const displayField = cfg.displayField ?? 'displayUrl'
  const displayType = cfg.displayType
  const resolvedConfig: DocumentVerificationConfig = {
    ...cfg,
    documentIdParam,
    showBackLink,
    showDocument,
    showDocumentTitle,
    displayTitle,
    displayField,
    displayType,
  }

  const getDocumentIdFromRoute = (): string => {
    const queryValue = route.query[documentIdParam]
    if (Array.isArray(queryValue)) {
      return queryValue[0] || ''
    }
    if (typeof queryValue === 'string') {
      return queryValue
    }
    return ''
  }

  const documentId = ref<string>(getDocumentIdFromRoute())

  watch(
    () => route.fullPath,
    () => {
      documentId.value = getDocumentIdFromRoute()
    }
  )

  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)
  const document = ref<Document | null>(null)
  const fields = ref<ResolvedField[]>([])

  const clearError = (): void => {
    error.value = null
  }

  const setDocumentId = (value: string): void => {
    documentId.value = value
  }

  const messages: DocumentVerificationMessages = {
    ...FALLBACK_MESSAGES,
    ...(resolvedConfig.messages || {}),
  }
  const requiredIdError = messages.requiredIdError!
  const verificationFailedError = messages.verificationFailedError!
  const generalError = messages.generalError!

  const deriveFieldDefinitions = (): FieldDefinition[] => {
    const configured = Array.isArray(resolvedConfig.fields) ? resolvedConfig.fields : []

    if (!configured.length) {
      return BASE_FIELD_DEFINITIONS
    }

    const keyFor = (field: FieldDefinition): string => field.key ?? field.label
    const overrideMap = new Map<string, FieldDefinition>()

    configured.forEach((field) => {
      overrideMap.set(keyFor(field), field)
    })

    const merged: FieldDefinition[] = BASE_FIELD_DEFINITIONS.map((baseField) => {
      const key = keyFor(baseField)
      if (overrideMap.has(key)) {
        const override = overrideMap.get(key)!
        overrideMap.delete(key)
        return override
      }
      return baseField
    })

    overrideMap.forEach((field) => {
      merged.push(field)
    })

    return merged
  }

  const resolveFieldValue = (
    field: FieldDefinition,
    raw: Record<string, any>,
    normalized: Record<string, any>
  ): unknown => {
    if (field.resolver) {
      return field.resolver(raw, normalized)
    }

    const possibleKeys: string[] = []

    if (field.key) {
      possibleKeys.push(field.key)
    }

    if (field.label) {
      const normalizedLabel = field.label.replace(/:/g, '').trim()
      if (normalizedLabel) {
        possibleKeys.push(normalizedLabel)
      }
    }

    for (const candidate of possibleKeys) {
      if (normalized[candidate] !== undefined) {
        return normalized[candidate]
      }

      if (raw[candidate] !== undefined) {
        return raw[candidate]
      }
    }

    return undefined
  }

  const normaliseValue = (value: unknown): string => {
    if (value === null || value === undefined) {
      return ''
    }
    return typeof value === 'string' ? value : String(value)
  }

  const buildResolvedFields = (
    raw: Record<string, any>,
    normalized: Record<string, any>
  ): ResolvedField[] => {
    const definitions = deriveFieldDefinitions()

    return definitions.map((definition) => {
      const type = (definition.type ?? 'text') as FieldType
      const rawValue = resolveFieldValue(definition, raw, normalized)
      let displayValue = normaliseValue(rawValue)
      const field: ResolvedField = {
        label: definition.label,
        key: definition.key,
        type,
        value: displayValue,
      }

      if (type === 'status') {
        const validityKey = NORMALIZED_FIELD_KEYS.isValid
        const validity =
          typeof normalized[validityKey] === 'boolean' ? normalized[validityKey] : undefined
        if (!displayValue && validity !== undefined) {
          displayValue = validity ? 'Valid' : 'Invalid'
          field.value = displayValue
        }
        if (validity !== undefined) {
          field.isValid = validity
        }
      }

      return field
    })
  }

  const buildVerificationUrl = (): string => {
    const endpoint = resolvedConfig.verificationEndpoint
    const encodedId = encodeURIComponent(documentId.value)

    const separator = endpoint.includes('?') ? '&' : '?'
    return `${endpoint}${separator}${documentIdParam}=${encodedId}`
  }

  const fetchDocument = async (): Promise<Record<string, any>> => {
    if (!documentId.value) {
      throw new DocumentVerificationError('MISSING_ID', requiredIdError)
    }

    let response: Response

    try {
      const targetUrl = buildVerificationUrl()
      response = await fetch(targetUrl)
    } catch (err) {
      if (err instanceof DocumentVerificationError) {
        throw err
      }
      throw new DocumentVerificationError('NETWORK', generalError, { cause: err })
    }

    if (!response.ok) {
      if (response.status === HTTP_STATUS_CODE.NOT_FOUND) {
        throw new DocumentVerificationError('NOT_FOUND', verificationFailedError)
      }

      throw new DocumentVerificationError('VERIFICATION_FAILED', verificationFailedError)
    }

    return await response.json()
  }

  const verifyDocument = async (): Promise<void> => {
    isLoading.value = true
    clearError()
    document.value = null
    fields.value = []

    try {
      const raw = await fetchDocument()
      const idField = resolvedConfig.idField ?? 'id'
      const issuedToField = resolvedConfig.issuedToField ?? 'issuedTo'
      const titleField = resolvedConfig.titleField ?? 'title'
      const issueDateField = resolvedConfig.issueDateField ?? 'issueDate'
      const statusField = resolvedConfig.statusField
      const validityField = resolvedConfig.validityField ?? 'isValid'
      const displayFieldKey = resolvedConfig.displayField ?? 'displayUrl'

      const id = readId(raw, idField)
      const issuedToRaw = readStringField(raw, issuedToField, '')
      const title = readStringField(raw, titleField, undefined)
      const issueDate = readStringField(raw, issueDateField, undefined)
      const displayAsset = readDisplayAsset(raw, displayFieldKey)

      let status = resolvedConfig.statusResolver ? resolvedConfig.statusResolver(raw) : undefined
      if (!status && statusField) {
        status = readStringField(raw, statusField, undefined)
      }

      const isValid = readBooleanFlag(raw, validityField, resolvedConfig.validityResolver)

      if (!status && typeof isValid === 'boolean') {
        status = isValid ? 'Valid' : 'Invalid'
      }

      const normalizedData: Record<string, any> = { ...raw }

      normalizedData[NORMALIZED_FIELD_KEYS.id] = id
      normalizedData[NORMALIZED_FIELD_KEYS.issuedTo] = issuedToRaw || null

      const optionalAssignments: Array<{ key: string; value: unknown; shouldSet: boolean }> = [
        { key: NORMALIZED_FIELD_KEYS.title, value: title, shouldSet: title !== undefined },
        {
          key: NORMALIZED_FIELD_KEYS.issueDate,
          value: issueDate,
          shouldSet: issueDate !== undefined,
        },
        { key: NORMALIZED_FIELD_KEYS.status, value: status, shouldSet: Boolean(status) },
        {
          key: NORMALIZED_FIELD_KEYS.isValid,
          value: isValid,
          shouldSet: typeof isValid === 'boolean',
        },
        {
          key: NORMALIZED_FIELD_KEYS.displayUrl,
          value: displayAsset,
          shouldSet: Boolean(displayAsset),
        },
      ]

      optionalAssignments.forEach(({ key, value, shouldSet }) => {
        if (shouldSet) {
          normalizedData[key] = value
        } else {
          delete normalizedData[key]
        }
      })

      if (resolvedConfig.displayType) {
        normalizedData[NORMALIZED_FIELD_KEYS.displayType] = resolvedConfig.displayType
      } else {
        const currentType = normalizedData[NORMALIZED_FIELD_KEYS.displayType]
        if (currentType !== 'image' && currentType !== 'pdf') {
          delete normalizedData[NORMALIZED_FIELD_KEYS.displayType]
        }
      }

      document.value = normalizedData as Document
      fields.value = buildResolvedFields(raw, normalizedData)
    } catch (err) {
      handleVerificationError(err)
    } finally {
      isLoading.value = false
    }
  }

  const handleVerificationError = (err: unknown): void => {
    if (err instanceof DocumentVerificationError) {
      error.value = err.message
      return
    }
    error.value = generalError
  }

  return {
    documentId,
    isLoading,
    error,
    document,
    fields,
    verifyDocument,
    clearError,
    setDocumentId,
    config: resolvedConfig,
  }
}
