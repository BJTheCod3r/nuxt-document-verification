import type { DocumentVerificationConfig } from '../../src/runtime/composables/types'

declare module 'nuxt/schema' {
  interface NuxtConfig {
    documentVerification?: DocumentVerificationConfig
  }

  interface PublicRuntimeConfig {
    documentVerification: DocumentVerificationConfig
  }
}

export {}
