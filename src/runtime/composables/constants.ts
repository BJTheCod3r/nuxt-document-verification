import type { FieldDefinition } from './types'

export const DEFAULT_DOCUMENT_ID_PARAM = 'document_id'

export const NORMALIZED_FIELD_KEYS = {
  id: 'id',
  issuedTo: 'issuedTo',
  title: 'title',
  issueDate: 'issueDate',
  status: 'status',
  isValid: 'isValid',
  displayUrl: 'displayUrl',
  displayType: 'displayType',
} as const

export const BASE_FIELD_DEFINITIONS: FieldDefinition[] = [
  { label: 'Document ID:', key: NORMALIZED_FIELD_KEYS.id, type: 'id' },
  { label: 'Issued To:', key: NORMALIZED_FIELD_KEYS.issuedTo, type: 'text' },
  { label: 'Title:', key: NORMALIZED_FIELD_KEYS.title, type: 'text' },
  { label: 'Issue Date:', key: NORMALIZED_FIELD_KEYS.issueDate, type: 'date' },
  { label: 'Status:', key: NORMALIZED_FIELD_KEYS.status, type: 'status' },
]
