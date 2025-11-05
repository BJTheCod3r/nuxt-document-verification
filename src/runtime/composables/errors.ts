import type { DocumentVerificationErrorCode } from './types'

export class DocumentVerificationError extends Error {
  constructor(
    public code: DocumentVerificationErrorCode,
    message?: string,
    options?: { cause?: unknown }
  ) {
    super(message, options)
    this.name = 'DocumentVerificationError'
  }
}
