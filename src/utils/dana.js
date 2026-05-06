export const DANA_STORAGE_KEY = 'suma-financiera:danaParam'

export function persistDanaParam(value) {
  if (!value) {
    return
  }

  try {
    localStorage.setItem(DANA_STORAGE_KEY, value)
  } catch (error) {
    console.error('No se pudo guardar el parámetro dana', error)
  }
}

export function getDanaParamFromSearch(search) {
  const params = new URLSearchParams(search || '')
  const fromQuery = params.get('dana')
  if (fromQuery) {
    persistDanaParam(fromQuery)
    return fromQuery
  }

  try {
    return localStorage.getItem(DANA_STORAGE_KEY) || ''
  } catch (error) {
    console.error('No se pudo obtener el parámetro dana almacenado', error)
    return ''
  }
}

export function buildPathWithDana(path, dana) {
  if (!dana) {
    return path
  }

  const [base, existingQuery] = path.split('?')
  const params = new URLSearchParams(existingQuery || '')
  params.set('dana', dana)
  const queryString = params.toString()
  return `${base}?${queryString}`
}
