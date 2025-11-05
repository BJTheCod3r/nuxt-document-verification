import type { DocumentVerificationConfig } from '../runtime/composables/types'

// Augment both 'nuxt/schema' and '@nuxt/schema' to ensure TS picks it up in different setups

declare module 'nuxt/schema' {
  interface NuxtConfig {
    documentVerification?: DocumentVerificationConfig
  }

  interface NuxtOptions {
    documentVerification?: DocumentVerificationConfig
  }

  interface PublicRuntimeConfig {
    documentVerification: DocumentVerificationConfig
  }
}

declare module '@nuxt/schema' {
  interface NuxtConfig {
    documentVerification?: DocumentVerificationConfig
  }

  interface NuxtOptions {
    documentVerification?: DocumentVerificationConfig
  }

  interface PublicRuntimeConfig {
    documentVerification: DocumentVerificationConfig
  }
}

export {}
