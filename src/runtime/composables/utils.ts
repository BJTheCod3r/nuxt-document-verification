export const getValue = (obj: Record<string, any>, key: string, fallback: any = '') =>
  key && obj && obj[key] != null ? obj[key] : fallback

export const readId = (data: Record<string, any>, idField: string): string => {
  return getValue(data, idField, '')
}

export const readDisplayAsset = (data: Record<string, any>, displayField: string): string => {
  return getValue(data, displayField, '')
}

export const readStringField = (
  data: Record<string, any>,
  field: string | undefined,
  fallback?: string
): string | undefined => {
  if (!field) {
    return fallback
  }

  const value = getValue(data, field, fallback)
  if (value === undefined || value === null) {
    return fallback
  }
  return String(value)
}

export const readBooleanFlag = (
  data: Record<string, any>,
  field: string | undefined,
  resolver?: (data: Record<string, any>) => boolean | undefined
): boolean | undefined => {
  if (resolver) {
    const resolved = resolver(data)
    if (typeof resolved === 'boolean') {
      return resolved
    }
  }

  if (!field) {
    return undefined
  }

  const value = getValue(data, field, undefined)
  if (value === undefined || value === null || value === '') {
    return undefined
  }

  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'number') {
    return value !== 0
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (normalized === 'true' || normalized === '1') {
      return true
    }
    if (normalized === 'false' || normalized === '0') {
      return false
    }
    if (normalized === '') {
      return undefined
    }
  }

  return Boolean(value)
}

export const omit = <T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
  const clone = { ...obj }
  for (const key of keys) {
    delete clone[key]
  }
  return clone
}
