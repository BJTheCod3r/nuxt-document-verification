// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['../nuxt'],
  documentVerification: {
    logo: '/document-icon.png',
    verificationEndpoint: '/api/verify-document',
    backLink: '/',
    backLinkText: 'Back to Home',
    buttonColor: '#4f46e5',
    buttonHoverColor: '#4338ca',
    fields: [
      { label: 'Document ID:', key: 'id', type: 'id' },
      { label: 'Issued To:', key: 'issuedTo', type: 'text' },
      { label: 'Programme:', key: 'title', type: 'text' },
      { label: 'Issue Date:', key: 'issueDate', type: 'date' },
      { label: 'Verification Status:', key: 'status', type: 'status' },
      { label: 'Supporting File:', key: 'supportingFile', type: 'pdf' },
      { label: 'Issued By:', key: 'issuer' },
      { label: 'Course', key: 'course', type: 'text' },
    ],
    showDocument: true,
    displayField: 'displayUrl',
    displayTitle: 'Document View',
    displayType: 'pdf',
    showDocumentTitle: false,
    documentIdParam: 'document_id',
    messages: {
      description: 'Please enter your document ID below to verify it.',
      requiredIdError: 'Please enter a document ID',
      verificationFailedError: 'We could not verify this document',
      generalError: 'Something went wrong. Please try again later.',
    },
  },
})
