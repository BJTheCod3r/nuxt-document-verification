<template>
  <div class="document-verification">
    <DocumentHeader :logo="config.logo" />

    <div class="content">
      <p class="dv-description">
        {{ config.messages?.description || 'Enter the document ID to verify its authenticity.' }}
      </p>

      <DocumentForm
        :document-id="documentId"
        :is-loading="isLoading"
        :button-color="config.buttonColor"
        :button-hover-color="config.buttonHoverColor"
        @verify="handleVerifySubmit"
        @focus="handleInputFocus"
      />

      <DocumentError v-if="error" :message="error" />

      <DocumentDetails
        v-if="document"
        :document="document"
        :fields="fields"
        :show-document="config.showDocument"
        :display-field="config.displayField"
        :display-title="config.displayTitle"
        :display-type="config.displayType"
        :show-document-title="config.showDocumentTitle"
      />
    </div>

    <DocumentFooter
      v-if="config.showBackLink !== false"
      :back-link="config.backLink"
      :back-link-text="config.backLinkText"
      :show-back-link="config.showBackLink"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDocumentVerification } from '../composables/useDocumentVerification'
import { DEFAULT_DOCUMENT_ID_PARAM } from '../composables/constants'
import DocumentHeader from './DocumentHeader.vue'
import DocumentForm from './DocumentForm.vue'
import DocumentError from './DocumentError.vue'
import DocumentDetails from './DocumentDetails.vue'
import DocumentFooter from './DocumentFooter.vue'
import '../assets/documentVerification.css'

const route = useRoute()
const router = useRouter()

const {
  documentId,
  isLoading,
  error,
  document,
  verifyDocument,
  clearError,
  setDocumentId,
  fields,
  config,
} = useDocumentVerification()

onMounted(() => {
  if (documentId.value) {
    verifyDocument()
  }
})

const handleInputFocus = () => {
  if (error.value) {
    clearError()
  }
}

const handleVerifySubmit = async (inputValue: string) => {
  const trimmedValue = inputValue.trim()
  setDocumentId(trimmedValue)

  const idParam = config.documentIdParam || DEFAULT_DOCUMENT_ID_PARAM
  const query = { ...route.query } as Record<string, any>

  if (trimmedValue) {
    query[idParam] = trimmedValue
  } else {
    delete query[idParam]
  }

  try {
    await router.replace({
      path: route.path,
      query,
      hash: route.hash,
    })
  } catch (err) {
    /* no-op: ignore navigation failures when target matches current route */
  }

  await verifyDocument()
}
</script>
