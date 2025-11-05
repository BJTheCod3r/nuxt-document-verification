import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import type { DocumentVerificationConfig } from '../composables/types'
import { DEFAULT_DOCUMENT_ID_PARAM } from '../composables/constants'
export default defineNuxtPlugin<{ documentVerification: DocumentVerificationConfig | undefined }>(
  () => {
    const config = useRuntimeConfig()
    const moduleConfig = config.public.documentVerification as
      | DocumentVerificationConfig
      | undefined

    if (!moduleConfig) {
      return {
        provide: {
          documentVerification: undefined,
        },
      }
    }

    const documentIdParam = moduleConfig.documentIdParam ?? DEFAULT_DOCUMENT_ID_PARAM
    const showBackLink = moduleConfig.showBackLink ?? true
    const showDocument = moduleConfig.showDocument ?? true
    const displayTitle = moduleConfig.displayTitle ?? 'Document Preview'
    const showDocumentTitle = moduleConfig.showDocumentTitle ?? true
    const displayField = moduleConfig.displayField ?? 'displayUrl'
    const displayType = moduleConfig.displayType

    const normalizedConfig: DocumentVerificationConfig = {
      ...moduleConfig,
      documentIdParam,
      showBackLink,
      showDocument,
      displayTitle,
      showDocumentTitle,
      displayField,
      displayType,
    }

    return {
      provide: {
        documentVerification: normalizedConfig,
      },
    }
  }
)
