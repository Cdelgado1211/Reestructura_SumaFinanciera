export function isServiceErrorResponse(payload, options = {}) {
  const { requireRecord = true } = options

  if (!payload || typeof payload !== 'object') {
    return true
  }

  if (payload.wsError) {
    return true
  }

  if (typeof payload.message === 'string' && payload.message.trim()) {
    return true
  }

  if (requireRecord) {
    const { record } = payload

    if (!record || typeof record !== 'object' || Array.isArray(record)) {
      return true
    }

    if (Object.keys(record).length === 0) {
      return true
    }
  }

  return false
}
