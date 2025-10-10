export function isServiceErrorResponse(payload) {
  if (!payload || typeof payload !== 'object') {
    return true
  }

  if (payload.wsError) {
    return true
  }

  if (typeof payload.message === 'string' && payload.message.trim()) {
    return true
  }

  const { record } = payload

  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    return true
  }

  if (Object.keys(record).length === 0) {
    return true
  }

  return false
}
