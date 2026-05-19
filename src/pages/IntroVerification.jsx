import React, { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useLocation } from 'react-router-dom'
import { isServiceErrorResponse } from '../utils/serviceResponse'
import { buildPathWithDana, getDanaParamFromSearch, persistDanaParam } from '../utils/dana'
import DatePickerButton from '../components/form/DatePickerButton'
import PrivacyNoticeBody from '../components/privacy/PrivacyNoticeBody'

export default function IntroVerification() {
  const navigate = useNavigate()
  const location = useLocation()
  const [docId, setDocId] = useState('')       // ← nuevo: número de cédula
  const [docDate, setDocDate] = useState('')
  const [clientName, setClientName] = useState('')
  const [expectedDocDate, setExpectedDocDate] = useState('')
  const [danaParam, setDanaParam] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [acceptPrivacy, setAcceptPrivacy] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)

  // Recupera datos del cliente desde el endpoint usando el parámetro `danaparam`
  useEffect(() => {
    const controller = new AbortController()
    const danaParamValue = getDanaParamFromSearch(location.search)

    if (!danaParamValue) {
      setDanaParam('')
      navigate('/error', { replace: true })
      return () => controller.abort()
    }

    setDanaParam(danaParamValue)
    persistDanaParam(danaParamValue)

    const fetchClientData = async () => {
      try {
        const response = await fetch(
          `https://lp5h7egegt2wlrfpur4egp6jge0hwvmy.lambda-url.us-east-1.on.aws/?dana=${encodeURIComponent(
            danaParamValue,
          )}&s=n`,
          { signal: controller.signal },
        )

        if (!response.ok) {
          console.error('[IntroVerification] Error HTTP en s=n', {
            status: response.status,
            statusText: response.statusText,
          })
          throw new Error(`Error ${response.status}`)
        }

        const data = await response.json()

        if (isServiceErrorResponse(data)) {
          console.warn('[IntroVerification] isServiceErrorResponse=true en s=n', { data })
          navigate('/error', { replace: true })
          return
        }
        const record = data?.record
        const nombre = getRecordName(record)

        const errorState = getErrorNavigationState(record)
        if (errorState) {
          console.warn('[IntroVerification] getErrorNavigationState devolvió errorState en s=n', {
            errorState,
            record,
          })
          navigate('/error', { replace: true, state: errorState })
          return
        }

        if (record) {
          setExpectedDocDate(normalizeRecordDate(record.FECHANACIMIENTO))
        }

        if (nombre) {
          setClientName(nombre)
          try {
            localStorage.setItem('suma-financiera:clienteNombre', nombre)
            localStorage.setItem('suma-financiera:clienteData', JSON.stringify(record))
          } catch (error) {
            console.error('No se pudo guardar la información del cliente', error)
          }
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('[IntroVerification] Excepción al obtener información del cliente s=n', {
            name: error.name,
            message: error.message,
          })
          navigate('/error', { replace: true })
        }
      }
    }

    fetchClientData()

    return () => controller.abort()
  }, [location.search, navigate])

  // Puede continuar si los datos están completos y contamos con la data del servicio
  const canContinue = Boolean(docId && docDate.length === 10 && danaParam && acceptPrivacy)

  // Usa el primer nombre disponible (o "Cliente" si aún no se conoce)
  const primerNombre = (clientName || 'Cliente').trim().split(/\s+/)[0] || 'Cliente'

  const onSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting) {
      return
    }

    const newErrors = {}

    if (!danaParam) {
      newErrors.general = 'No pudimos validar tus datos. Intenta nuevamente más tarde.'
    }

    if (!docId.trim()) {
      newErrors.docId = 'Ingresa tu número de cédula.'
    }

    const normalizedInputDate = docDate

    if (!docDate) {
      newErrors.docDate = 'Ingresa la fecha de nacimiento.'
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedInputDate)) {
      newErrors.docDate = 'El formato de la fecha debe ser dd-mm-aaaa.'
    }

    if (!acceptPrivacy) {
      newErrors.privacy = 'Debes aceptar el Aviso de Privacidad para continuar.'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setIsSubmitting(true)

    try {
      const response = await fetch(
        `https://lp5h7egegt2wlrfpur4egp6jge0hwvmy.lambda-url.us-east-1.on.aws/?dana=${encodeURIComponent(
          danaParam,
        )}&s=v`,
      )

      if (!response.ok) {
        console.error('[IntroVerification] Error HTTP en s=v', {
          status: response.status,
          statusText: response.statusText,
        })
        throw new Error(`Error ${response.status}`)
      }

      const data = await response.json()
      if (isServiceErrorResponse(data)) {
        console.warn('[IntroVerification] isServiceErrorResponse=true en s=v', { data })
        navigate('/error', { replace: true })
        return
      }
      const record = data?.record

      if (!record) {
        throw new Error('Sin datos para validar')
      }

      const errorState = getErrorNavigationState(record)
      if (errorState) {
        console.warn('[IntroVerification] getErrorNavigationState devolvió errorState en s=v', {
          errorState,
          record,
        })
        navigate('/error', { replace: true, state: errorState })
        return
      }

      const validatedName = getRecordName(record)
      if (validatedName) {
        setClientName(validatedName)
      }

      const matchesDocId = compareDocumentId(docId, record.CEDULA)
      const normalizedRecordDate = normalizeRecordDate(record.FECHANACIMIENTO)
      const matchesDate = normalizedRecordDate && normalizedInputDate === normalizedRecordDate

      if (normalizedRecordDate) {
        setExpectedDocDate(normalizedRecordDate)
      }

      const validationErrors = {}

      if (!matchesDocId) {
        validationErrors.docId = 'El número de cédula no coincide con nuestros registros.'
      }

      if (!matchesDate) {
        validationErrors.docDate = 'La fecha de nacimiento no coincide con nuestros registros.'
      }

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors)
        return
      }

      try {
        localStorage.setItem('suma-financiera:clienteDataValidada', JSON.stringify(record))
      } catch (error) {
        console.error('No se pudo guardar la validación del cliente', error)
      }

      setErrors({})
      navigate(buildPathWithDana('/plan', danaParam))
    } catch (error) {
      console.error('[IntroVerification] Excepción al validar información del cliente s=v', {
        name: error.name,
        message: error.message,
      })
      if (error.name !== 'AbortError') {
        navigate('/error', { replace: true })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <section className="bg-white rounded-2xl shadow p-6 sm:p-8">
            <form onSubmit={onSubmit} className="max-w-md mx-auto">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center">
                ¡Hola {primerNombre}!
              </h1>
              <p className="text-center text-gray-600 mt-2">
                Accede a la página de Reestructuración de deuda
              </p>

              {/* Bloque: datos de cédula */}
              <div className="mt-8">
                <p className="text-sm text-gray-500 font-medium">
                  Ingresa los datos de tu cédula
                </p>

                {/* Número de cédula */}
                <label className="block mt-3">
                  <div className="border rounded-lg px-3 py-3">
                    <div className="flex items-center gap-3">
                      <IdCardIcon className="w-5 h-5 text-gray-600" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-600 leading-none">
                          Número de cédula
                        </p>
                        <input
                          type="text"
                          inputMode="text"
                          placeholder="Ej. 123-456-789"
                          value={docId}
                          onChange={(e) => {
                            setDocId(e.target.value)
                            setErrors((prev) => ({ ...prev, docId: undefined, general: undefined }))
                          }}
                          className="mt-1 w-full bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
                          aria-label="Número de cédula"
                        />
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">Incluye los guiones</p>
                  {errors.docId && <p className="mt-1 text-xs text-red-600">{errors.docId}</p>}
                </label>

                {/* Fecha de nacimiento (debajo de cédula) */}
                <label className="block mt-3">
                  <div className="flex items-center gap-3 border rounded-lg px-3 py-3">
                    <CalendarIcon className="w-5 h-5 text-gray-500" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-600 leading-none">Fecha de nacimiento</p>
                      <DatePickerButton
                        value={docDate}
                        onChange={(nextValue) => {
                          setDocDate(nextValue || '')
                          setErrors((prev) => ({ ...prev, docDate: undefined, general: undefined }))
                        }}
                        placeholder="DD/MM/YYYY"
                        ariaLabel="Fecha de nacimiento"
                      />
                    </div>
                  </div>
                  {expectedDocDate && (
                    <p className="mt-2 text-xs text-gray-500">
                      Fecha de nacimiento registrada: {formatDateForDisplay(expectedDocDate)}
                    </p>
                  )}
                  {errors.docDate && <p className="mt-1 text-xs text-red-600">{errors.docDate}</p>}
                </label>
              </div>

              <label className="mt-6 flex items-start gap-3 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={acceptPrivacy}
                  onChange={(event) => {
                    setAcceptPrivacy(event.target.checked)
                    setErrors((prev) => ({ ...prev, privacy: undefined, general: undefined }))
                  }}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                />
                <span>
                  He leído y aceptado el tratamiento de mis datos conforme al{' '}
                  <button
                    type="button"
                    onClick={() => setShowPrivacyModal(true)}
                    className="text-left text-black hover:text-gray-900 font-semibold underline"
                  >
                    Aviso de Privacidad de Example Insurance, disponible aquí
                  </button>
                  .
                </span>
              </label>
              {errors.privacy && <p className="mt-2 text-xs text-red-600">{errors.privacy}</p>}

              {/* Botón */}
              <div className="mt-8 flex justify-center">
                {errors.general && (
                  <p className="mr-4 text-sm text-red-600 self-center">{errors.general}</p>
                )}
                <button
                  type="submit"
                  disabled={!canContinue || isSubmitting}
                  className={[
                    'px-6 py-3 rounded-full font-semibold transition-colors',
                    canContinue
                      ? 'bg-brand-500 hover:bg-brand-500 text-gray-900'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed',
                  ].join(' ')}
                >
                  {isSubmitting ? 'Validando…' : 'Ingresar'}
                </button>
              </div>
            </form>
          </section>
      </div>
      {showPrivacyModal && (
        <PrivacyNoticeModal
          onClose={() => setShowPrivacyModal(false)}
          onAccept={() => {
            setAcceptPrivacy(true)
            setErrors((prev) => ({ ...prev, privacy: undefined, general: undefined }))
          }}
        />
      )}
    </div>
  )
}

/* --- helpers --- */
function normalizeRecordDate(value) {
  if (!value) return ''

  const parts = value.split(/[/-]/).map((part) => part.trim())
  if (parts.length !== 3) return ''

  let [day, month, year] = parts
  const pad = (segment, target = 2) => segment.padStart(target, '0')

  if (year.length === 2) {
    // Suponemos fechas futuras => pertenecen a 2000+
    year = Number(year) >= 50 ? `19${year}` : `20${year}`
  }

  if (!day || !month || !year) {
    return ''
  }

  return `${pad(year, 4)}-${pad(month)}-${pad(day)}`
}

function formatDateForDisplay(isoDate) {
  if (!isoDate) return ''
  const [year, month, day] = isoDate.split('-')
  if (!year || !month || !day) return ''
  return `${day}-${month}-${year}`
}

function compareDocumentId(input, expected) {
  const normalize = (value) => (value || '').replace(/[\s-]/g, '').toUpperCase()
  return normalize(input) === normalize(expected)
}

function getRecordName(record) {
  if (!record || typeof record !== 'object') {
    return ''
  }

  if (typeof record.NOMBRE === 'string' && record.NOMBRE.trim()) {
    return record.NOMBRE.trim()
  }

  if (typeof record.nombre === 'string' && record.nombre.trim()) {
    return record.nombre.trim()
  }

  return ''
}

function hasCommittedChoice(value) {
  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'number') {
    return value === 1
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    return normalized === 'true' || normalized === '1' || normalized === 'si'
  }

  return false
}

function getErrorNavigationState(record) {
  if (!record) {
    return null
  }

  if (hasCommittedChoice(record.USER_COMMITTED_CHOICE)) {
    return { messageKey: 'committedChoice' }
  }

  return null
}

function PrivacyNoticeModal({ onClose, onAccept }) {
  const stopPropagation = useCallback((event) => {
    event.stopPropagation()
  }, [])

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-modal-title"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" aria-hidden="true" />
      <div
        className="relative z-10 flex w-full max-w-3xl max-h-[90vh] flex-col overflow-hidden rounded-3xl bg-white shadow-xl"
        onClick={stopPropagation}
      >
        <header className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <p id="privacy-modal-title" className="privacy-heading uppercase text-black">
              CONSENTIMIENTO DE TRATAMIENTO DE DATOS
            </p>
            <p className="mt-2 privacy-body text-black">
              Al entregar tu información, declaras que has leído, entiendes y aceptas el tratamiento
              de tus datos conforme al Aviso de Privacidad de Example Insurance.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-4 rounded-full p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            aria-label="Cerrar aviso de privacidad"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4 pr-4" aria-label="Aviso de privacidad">
          <PrivacyNoticeBody className="pb-6" />
        </div>
        <div className="flex justify-center border-t border-gray-100 px-6 py-5">
          <button
            type="button"
            onClick={() => {
              if (onAccept) {
                onAccept()
              }
              onClose()
            }}
            className="inline-flex items-center justify-center rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

function CloseIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path d="m6 6 8 8M6 14l8-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function CalendarIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="4.5" width="18" height="16" rx="2.5" stroke="currentColor" />
      <path d="M3 9h18" stroke="currentColor" />
      <path d="M8 3v3M16 3v3" stroke="currentColor" />
    </svg>
  )
}

function IdCardIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" />
      <circle cx="9" cy="11" r="2" stroke="currentColor" />
      <path d="M6.5 15.5c0-1.38 1.57-2.5 3.5-2.5s3.5 1.12 3.5 2.5" stroke="currentColor" />
      <path d="M14.5 10.5h4M14.5 13h4" stroke="currentColor" />
    </svg>
  )
}
