import './types/runtime-config'

import { defineNuxtModule, createResolver, addComponent, addImportsDir, addPlugin } from '@nuxt/kit'
import type { DocumentVerificationConfig } from './runtime/composables/types'
import { BASE_FIELD_DEFINITIONS } from './runtime/composables/constants'

export default defineNuxtModule<DocumentVerificationConfig>({
  meta: {
    name: 'document-verification',
    configKey: 'documentVerification',
    compatibility: {
      nuxt: '^3.0.0',
    },
  },
  defaults: {
    logo: '/logo.png',
    verificationEndpoint: '/api/verify-document',
    backLink: '/',
    backLinkText: 'Back to Home',
    buttonColor: '#4f46e5',
    buttonHoverColor: '#4338ca',
    fields: BASE_FIELD_DEFINITIONS,
    showDocument: true,
    displayTitle: 'Document Preview',
    showDocumentTitle: true,
    displayField: 'displayUrl',
    documentIdParam: 'document_id',
    messages: {
      description: 'Enter the document ID to verify its authenticity.',
      requiredIdError: 'Document ID is required',
      verificationFailedError: 'Failed to verify document',
      generalError: 'An error occurred while verifying the document',
    },
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    addComponent({
      name: 'DocumentVerification',
      filePath: resolver.resolve('./runtime/components/DocumentVerification.vue'),
    })

    addImportsDir(resolver.resolve('./runtime/composables'))

    addPlugin({
      src: resolver.resolve('./runtime/plugins/document-verification'),
    })

    nuxt.options.runtimeConfig.public.documentVerification = options
  },
})
