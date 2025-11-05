export type RawDocument = Record<string, any>

export type DocumentField = 'image' | 'pdf'

export type FieldType = 'id' | 'text' | 'status' | DocumentField | 'date'

export interface FieldDefinition {
  label: string
  type?: FieldType
  key?: string
  resolver?: (raw: RawDocument, current: Record<string, any>) => unknown
}

/**
 * Document data structure.
 */
export interface Document {
  id: string
  issuedTo?: string | null
  title?: string
  issueDate?: string
  status?: string
  isValid?: boolean
  displayUrl?: string
  displayType?: DocumentField
  [key: string]: any
}

export interface DocumentVerificationMessages {
  description?: string
  requiredIdError?: string
  verificationFailedError?: string
  generalError?: string
  missingConfigError?: string
}

/**
 * Resolved field data.
 */
export interface ResolvedField {
  label: string
  value: string
  key?: string
  type?: FieldType
  isValid?: boolean
}

/**
 * Configuration options for the document verification component.
 */
export interface DocumentVerificationConfig {
  logo: string
  verificationEndpoint: string
  backLink: string
  backLinkText: string
  showBackLink?: boolean
  buttonColor: string
  buttonHoverColor: string
  fields?: FieldDefinition[]
  showDocument?: boolean
  displayField?: string
  displayType?: DocumentField
  displayTitle?: string
  showDocumentTitle?: boolean
  idField?: string
  issuedToField?: string
  issueDateField?: string
  titleField?: string
  statusField?: string
  statusResolver?: (document: RawDocument) => string
  validityField?: string
  validityResolver?: (document: RawDocument) => boolean
  documentIdParam?: string
  messages?: DocumentVerificationMessages
}

/**
 * Error codes for document verification.
 */
export type DocumentVerificationErrorCode =
  | 'MISSING_ID'
  | 'NOT_FOUND'
  | 'VERIFICATION_FAILED'
  | 'NETWORK'
  | 'UNKNOWN'
  | 'CONFIG'

export enum HTTP_STATUS_CODE {
  NOT_FOUND = 404,
}
