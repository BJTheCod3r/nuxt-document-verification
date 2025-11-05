import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick, ref, isRef } from 'vue'
import DocumentVerification from '../src/runtime/components/DocumentVerification.vue'
import { useDocumentVerification } from '../src/runtime/composables/useDocumentVerification'
import type { ResolvedField } from '../src/runtime/composables/types'
import DocumentHeader from '../src/runtime/components/DocumentHeader.vue'
import DocumentForm from '../src/runtime/components/DocumentForm.vue'
import DocumentError from '../src/runtime/components/DocumentError.vue'
import DocumentDetails from '../src/runtime/components/DocumentDetails.vue'
import DocumentFooter from '../src/runtime/components/DocumentFooter.vue'
import { omit } from '../src/runtime/composables/utils'

const replaceMock = vi.fn()
const routeMock = {
  path: '/documents/verify',
  fullPath: '/documents/verify',
  hash: '',
  query: {} as Record<string, string>,
}

vi.mock('vue-router', () => ({
  useRoute: () => routeMock,
  useRouter: () => ({
    replace: replaceMock,
  }),
}))

vi.mock('../src/runtime/composables/useDocumentVerification', () => ({
  useDocumentVerification: vi.fn(),
}))

type UseDocumentVerificationReturn = ReturnType<typeof useDocumentVerification>

interface VerifiedDocument {
  id: string
  issuedTo: string
  title: string
  issueDate: string
  isValid: boolean
  status?: string
  displayUrl?: string
  [key: string]: any
}

interface FieldMapping {
  label: string
  key: string
  type?: 'text' | 'status' | 'id' | 'date'
}

interface VerificationConfig {
  logo: string
  verificationEndpoint: string
  backLink: string
  backLinkText: string
  buttonColor: string
  buttonHoverColor: string
  fields?: FieldMapping[]
  showDocument?: boolean
  showDocumentTitle?: boolean
  displayTitle?: string
  displayField?: string
  displayType?: 'image' | 'pdf'
  documentIdParam?: string
  messages?: Record<string, string>
}

describe('DocumentVerification', () => {
  let wrapper: VueWrapper
  let verifyDocumentMock: ReturnType<typeof vi.fn>
  let clearErrorMock: ReturnType<typeof vi.fn>
  let setDocumentIdMock: ReturnType<typeof vi.fn>
  let buildMock: (overrides?: Record<string, any>) => UseDocumentVerificationReturn
  const originalURL = global.URL
  const originalPushState = window.history.pushState

  beforeEach(() => {
    replaceMock.mockResolvedValue(undefined)
    routeMock.query = {}
    routeMock.fullPath = '/documents/verify'

    verifyDocumentMock = vi.fn()
    clearErrorMock = vi.fn()
    setDocumentIdMock = vi.fn()

    const defaultConfig: VerificationConfig = {
      logo: '/logo.png',
      verificationEndpoint: '/api/verify-document',
      backLink: '/',
      backLinkText: 'Back to Home',
      buttonColor: '#4f46e5',
      buttonHoverColor: '#4338ca',
      fields: [
        { label: 'Document ID:', key: 'id', type: 'id' },
        { label: 'Issued To:', key: 'issuedTo', type: 'text' },
        { label: 'Title:', key: 'title', type: 'text' },
        { label: 'Issue Date:', key: 'issueDate', type: 'date' },
        { label: 'Status:', key: 'status', type: 'status' },
      ],
      showDocument: true,
      displayTitle: 'Document Preview',
      showDocumentTitle: true,
      displayField: 'displayUrl',
      displayType: undefined,
      documentIdParam: 'document_id',
      messages: {
        description: 'Enter the document ID to verify its authenticity.',
      },
    }

    buildMock = (overrides = {}) => {
      const { config: configOverrides, ...rest } = overrides

      const coerceRef = <T>(v: any, fallback: T) => {
        if (isRef(v)) return v
        if (v && typeof v === 'object' && 'value' in v) {
          return ref(v.value as T)
        }
        return ref((v as T) ?? fallback)
      }

      const documentId = coerceRef(rest.documentId, 'DOC-123456') as any
      const isLoading = coerceRef(rest.isLoading, false) as any
      const error = coerceRef(rest.error, null) as any
      const document = coerceRef(rest.document, null) as any
      const fields = coerceRef<ResolvedField[]>(rest.fields, []) as any

      const restProps = omit(rest, ['documentId', 'isLoading', 'error', 'document', 'fields'])

      return {
        documentId,
        isLoading,
        error,
        document,
        verifyDocument: verifyDocumentMock,
        clearError: clearErrorMock,
        setDocumentId: setDocumentIdMock,
        fields,
        config: {
          ...defaultConfig,
          ...(configOverrides || {}),
        },
        ...restProps,
      } as unknown as UseDocumentVerificationReturn
    }

    vi.mocked(useDocumentVerification).mockReturnValue(buildMock())

    const mockChildComponents = {
      DocumentHeader: {
        template: '<div class="mock-header"><slot /></div>',
        props: ['logo'],
      },
      DocumentForm: {
        template:
          '<div class="mock-form" @click="$emit(\'verify\', \'DOC-CLICK\')" @focus="$emit(\'focus\')"></div>',
        props: ['documentId', 'isLoading', 'buttonColor', 'buttonHoverColor'],
        emits: ['verify', 'focus'],
      },
      DocumentError: {
        template: '<div class="mock-error">{{ message }}</div>',
        props: ['message'],
      },
      DocumentDetails: {
        template: '<div class="mock-details"></div>',
        props: [
          'document',
          'fields',
          'showDocument',
          'displayField',
          'displayTitle',
          'displayType',
          'showDocumentTitle',
        ],
      },
      DocumentFooter: {
        template: '<div class="mock-footer"></div>',
        props: ['backLink', 'backLinkText'],
      },
    }

    wrapper = mount(DocumentVerification, {
      global: {
        stubs: mockChildComponents,
      },
    })
  })

  afterEach(() => {
    global.URL = originalURL
    window.history.pushState = originalPushState
    replaceMock.mockReset()
  })

  it('renders the verification layout', () => {
    expect(wrapper.find('.document-verification').exists()).toBe(true)
    expect(wrapper.findComponent(DocumentHeader).exists()).toBe(true)
    expect(wrapper.findComponent(DocumentForm).props('documentId')).toBe('DOC-123456')
    expect(wrapper.findComponent(DocumentFooter).props()).toMatchObject({
      backLink: '/',
      backLinkText: 'Back to Home',
    })
  })

  it('clears errors when form requests focus', async () => {
    vi.mocked(useDocumentVerification).mockReturnValue(
      buildMock({ error: { value: 'Some error' } })
    )

    wrapper = mount(DocumentVerification, {
      global: {
        stubs: {
          DocumentHeader: true,
          DocumentForm: true,
          DocumentError: true,
          DocumentDetails: true,
          DocumentFooter: true,
        },
      },
    })

    wrapper.findComponent(DocumentForm).vm.$emit('focus')
    expect(clearErrorMock).toHaveBeenCalled()
  })

  it('emits verify when the form requests verification', async () => {
    wrapper.findComponent(DocumentForm).vm.$emit('verify', 'DOC-777')
    await nextTick()
    expect(setDocumentIdMock).toHaveBeenCalledWith('DOC-777')
    expect(replaceMock).toHaveBeenCalled()
    expect(verifyDocumentMock).toHaveBeenCalled()
  })

  it('passes loading state to the form', () => {
    vi.mocked(useDocumentVerification).mockReturnValue(
      buildMock({
        isLoading: { value: true },
      })
    )

    wrapper = mount(DocumentVerification, {
      global: {
        stubs: {
          DocumentHeader: true,
          DocumentForm: true,
          DocumentError: true,
          DocumentDetails: true,
          DocumentFooter: true,
        },
      },
    })

    expect(wrapper.findComponent(DocumentForm).props('isLoading')).toBe(true)
  })

  it('displays errors when provided', () => {
    vi.mocked(useDocumentVerification).mockReturnValue(
      buildMock({
        error: { value: 'Document not found' },
      })
    )

    wrapper = mount(DocumentVerification, {
      global: {
        stubs: {
          DocumentHeader: true,
          DocumentForm: true,
          DocumentError: true,
          DocumentDetails: true,
          DocumentFooter: true,
        },
      },
    })

    expect(wrapper.findComponent(DocumentError).exists()).toBe(true)
    expect(wrapper.findComponent(DocumentError).props('message')).toBe('Document not found')
  })

  it('shows document details when available', () => {
    const documentData: VerifiedDocument = {
      id: 'DOC-123456',
      issuedTo: 'Ada Lovelace',
      title: 'Computer Science',
      issueDate: '2023-01-01',
      isValid: true,
      status: 'Valid',
      displayUrl: 'https://example.com/documents/DOC-123456.png',
      displayType: 'image',
    }

    const resolvedFields: ResolvedField[] = [
      { label: 'Document ID:', key: 'id', type: 'id', value: 'DOC-123456' },
      { label: 'Issued To:', key: 'issuedTo', type: 'text', value: 'Ada Lovelace' },
      { label: 'Title:', key: 'title', type: 'text', value: 'Computer Science' },
      { label: 'Issue Date:', key: 'issueDate', type: 'date', value: '2023-01-01' },
      { label: 'Status:', key: 'status', type: 'status', value: 'Valid', isValid: true },
    ]

    vi.mocked(useDocumentVerification).mockReturnValue(
      buildMock({
        document: { value: documentData },
        fields: { value: resolvedFields },
      })
    )

    wrapper = mount(DocumentVerification, {
      global: {
        stubs: {
          DocumentHeader: true,
          DocumentForm: true,
          DocumentError: true,
          DocumentDetails: true,
          DocumentFooter: true,
        },
      },
    })

    const details = wrapper.findComponent(DocumentDetails)
    expect(details.props('document')).toEqual(documentData)
    expect(details.props('fields')).toEqual(resolvedFields)
    expect(details.props('displayTitle')).toBe('Document Preview')
    expect(details.props('displayType')).toBeUndefined()
  })

  it('honours custom field configuration', () => {
    const documentData: VerifiedDocument = {
      id: 'DOC-123456',
      issuedTo: 'Ada Lovelace',
      title: 'Computer Science',
      issueDate: '2023-01-01',
      isValid: true,
      status: 'Valid',
      displayUrl: 'https://example.com/documents/DOC-123456.png',
      displayType: 'image',
      issuer: 'Org',
    }

    const customFields: FieldMapping[] = [
      { label: 'Identifier', key: 'id' },
      { label: 'Issued To', key: 'issuedTo' },
      { label: 'Program', key: 'title' },
      { label: 'Status', key: 'status', type: 'status' },
      { label: 'Issuer', key: 'issuer' },
    ]

    const resolvedCustomFields: ResolvedField[] = [
      { label: 'Identifier', key: 'id', value: 'DOC-123456' },
      { label: 'Issued To', key: 'issuedTo', value: 'Ada Lovelace' },
      { label: 'Program', key: 'title', value: 'Computer Science' },
      { label: 'Status', key: 'status', type: 'status', value: 'Valid', isValid: true },
      { label: 'Issuer', key: 'issuer', value: 'Org' },
    ]

    vi.mocked(useDocumentVerification).mockReturnValue(
      buildMock({
        document: { value: documentData },
        config: {
          fields: customFields,
        },
        fields: { value: resolvedCustomFields },
      })
    )

    wrapper = mount(DocumentVerification, {
      global: {
        stubs: {
          DocumentHeader: true,
          DocumentForm: true,
          DocumentError: true,
          DocumentDetails: true,
          DocumentFooter: true,
        },
      },
    })

    const details = wrapper.findComponent(DocumentDetails)
    expect(details.props('fields')).toEqual(resolvedCustomFields)
    expect(details.props('document')).toEqual(documentData)
  })

  it('respects showDocument flag', () => {
    const documentData = { id: 'X', isValid: true } as any
    vi.mocked(useDocumentVerification).mockReturnValue(
      buildMock({
        document: { value: documentData },
        config: {
          showDocument: false,
        },
      })
    )

    wrapper = mount(DocumentVerification, {
      global: {
        stubs: {
          DocumentHeader: true,
          DocumentForm: true,
          DocumentError: true,
          DocumentDetails: true,
          DocumentFooter: true,
        },
      },
    })

    const details = wrapper.findComponent(DocumentDetails)
    expect(details.exists()).toBe(true)
    expect(details.props('showDocument')).toBe(false)
    expect(details.props('displayField')).toBe('displayUrl')
    expect(details.props('displayType')).toBeUndefined()
  })

  it('updates the URL using the configured parameter', async () => {
    vi.mocked(useDocumentVerification).mockReturnValue(
      buildMock({
        config: {
          documentIdParam: 'custom_param',
        },
      })
    )

    wrapper = mount(DocumentVerification, {
      global: {
        stubs: {
          DocumentHeader: true,
          DocumentForm: true,
          DocumentError: true,
          DocumentDetails: true,
          DocumentFooter: true,
        },
      },
    })

    await wrapper.findComponent(DocumentForm).vm.$emit('verify', 'DOC-999')
    await nextTick()

    const calledWith = replaceMock.mock.calls[0][0]
    expect(calledWith).toMatchObject({
      path: routeMock.path,
      hash: routeMock.hash,
      query: expect.objectContaining({ custom_param: 'DOC-999' }),
    })
  })

  it('renders custom description message', () => {
    vi.mocked(useDocumentVerification).mockReturnValue(
      buildMock({
        config: {
          messages: {
            description: 'Verify your document number below.',
          },
        },
      })
    )

    wrapper = mount(DocumentVerification)

    expect(wrapper.find('.dv-description').text()).toBe('Verify your document number below.')
  })
})
