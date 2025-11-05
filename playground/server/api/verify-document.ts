import { defineEventHandler, getQuery } from 'h3'
import type { Document } from '../../../src/runtime/composables/types'
import { HTTP_STATUS_CODE } from '../../../src/runtime/composables/types'

const documents: Record<string, Document> = {
  'DOC-123456': {
    id: 'DOC-123456',
    recipient: 'John Doe',
    course: 'Web Development Fundamentals',
    issueDate: '2023-01-15',
    isValid: true,
    displayUrl: 'https://placehold.co/600x400/png?text=Document+CERT-123456',
    displayType: 'image',
    issuer: 'Document Verification Board',
  },
  'DOC-789012': {
    id: 'DOC-789012',
    recipient: 'Jane Smith',
    course: 'Advanced JavaScript',
    issueDate: '2023-03-22',
    isValid: true,
    displayUrl: 'https://placehold.co/600x400/png?text=Document+CERT-789012',
    displayType: 'image',
    issuer: 'Document Verification Board',
  },
  'DOC-345678': {
    id: 'DOC-345678',
    recipient: 'Bob Johnson',
    course: 'UI/UX Design Principles',
    issueDate: '2023-05-10',
    isValid: false,
    displayUrl: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
    displayType: 'pdf',
    issuer: 'Document Verification Board',
  },
  'DOC-123498': {
    id: 'DOC-123498',
    recipient: 'Ryan Smith',
    course: 'Cybersecurity Basics',
    issueDate: '2023-01-15',
    isValid: true,
    displayUrl: '/document.pdf',
    issuer: 'Document Verification Board',
  },
}

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const documentId = query.document_id as string

  if (!documentId) {
    return {
      statusCode: HTTP_STATUS_CODE.NOT_FOUND,
      message: 'Document ID is required',
    }
  }

  const document = documents[documentId]

  if (!document) {
    return {
      statusCode: HTTP_STATUS_CODE.NOT_FOUND,
      message: 'Document not found',
    }
  }

  return document
})
