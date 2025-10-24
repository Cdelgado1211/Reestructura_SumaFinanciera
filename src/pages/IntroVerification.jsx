import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { isServiceErrorResponse } from '../utils/serviceResponse'
import { buildPathWithDana, getDanaParamFromSearch, persistDanaParam } from '../utils/dana'
import pantalla1 from '../assets/pantalla1.png'   // tu imagen local

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
          `https://3nift3okknzemzfp7y4u57q6ne0lwfnj.lambda-url.us-east-1.on.aws/?dana=${encodeURIComponent(
            danaParamValue,
          )}&s=n`,
          { signal: controller.signal },
        )

        if (!response.ok) {
          throw new Error(`Error ${response.status}`)
        }

        const data = await response.json()

        if (isServiceErrorResponse(data)) {
          navigate('/error', { replace: true })
          return
        }
        const record = data?.record
        const nombre = record?.nombre

        if (record && hasCommittedChoice(record.USER_COMMITTED_CHOICE)) {
          navigate('/error', { replace: true, state: { messageKey: 'alreadyCommitted' } })
          return
        }

        if (record) {
          setExpectedDocDate(normalizeRecordDate(record.P_FECHA_EXP))
        }

        if (nombre) {
          setClientName(nombre)
          try {
            localStorage.setItem('banistmo:clienteNombre', nombre)
            localStorage.setItem('banistmo:clienteData', JSON.stringify(record))
          } catch (error) {
            console.error('No se pudo guardar la información del cliente', error)
          }
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('No se pudo obtener la información del cliente', error)
          navigate('/error', { replace: true })
        }
      }
    }

    fetchClientData()

    return () => controller.abort()
  }, [location.search, navigate])

  // Puede continuar si los datos están completos y contamos con la data del servicio
  const canContinue = Boolean(docId && docDate.length === 10 && danaParam)

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

    const normalizedInputDate = normalizeDisplayDate(docDate)

    if (!docDate) {
      newErrors.docDate = 'Ingresa la fecha de expiración.'
    } else if (!normalizedInputDate) {
      newErrors.docDate = 'El formato de la fecha debe ser dd-mm-aaaa.'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setIsSubmitting(true)

    try {
      const response = await fetch(
        `https://3nift3okknzemzfp7y4u57q6ne0lwfnj.lambda-url.us-east-1.on.aws/?dana=${encodeURIComponent(
          danaParam,
        )}&s=v`,
      )

      if (!response.ok) {
        throw new Error(`Error ${response.status}`)
      }

      const data = await response.json()
      if (isServiceErrorResponse(data)) {
        navigate('/error', { replace: true })
        return
      }
      const record = data?.record

      if (!record) {
        throw new Error('Sin datos para validar')
      }

      if (hasCommittedChoice(record.USER_COMMITTED_CHOICE)) {
        navigate('/error', { replace: true, state: { messageKey: 'alreadyCommitted' } })
        return
      }

      if (record.nombre) {
        setClientName(record.nombre)
      }

      const matchesDocId = compareDocumentId(docId, record.EN_CED_RUC)
      const normalizedRecordDate = normalizeRecordDate(record.P_FECHA_EXP)
      const matchesDate = normalizedRecordDate && normalizedInputDate === normalizedRecordDate

      if (normalizedRecordDate) {
        setExpectedDocDate(normalizedRecordDate)
      }

      const validationErrors = {}

      if (!matchesDocId) {
        validationErrors.docId = 'El número de cédula no coincide con nuestros registros.'
      }

      if (!matchesDate) {
        validationErrors.docDate = 'La fecha de expiración no coincide con nuestros registros.'
      }

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors)
        return
      }

      try {
        localStorage.setItem('banistmo:clienteDataValidada', JSON.stringify(record))
      } catch (error) {
        console.error('No se pudo guardar la validación del cliente', error)
      }

      setErrors({})
      navigate(buildPathWithDana('/aviso-privacidad', danaParam))
    } catch (error) {
      console.error('No se pudo validar la información del cliente', error)
      if (error.name !== 'AbortError') {
        navigate('/error', { replace: true })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Tarjeta izquierda */}
          <section className="bg-white rounded-2xl shadow p-6 sm:p-8 flex flex-col items-center">
            <div className="w-64 h-48 sm:w-72 sm:h-56 rounded-xl overflow-hidden mb-6 bg-gray-100">
              <img
                src={pantalla1}
                alt="Persona feliz de Reestructura tu deuda"
                className="w-full h-full object-cover"
              />
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center">
              Arreglo de pagos
            </h2>
            <p className="text-center text-gray-600 mt-3 max-w-[40ch]">
              Es tu oportunidad para tener la tranquilidad de estar al día con tus pagos
            </p>

            <div className="mt-6 space-y-4 w-full max-w-sm">
              <Feature
                icon={<CalendarIcon className="w-6 h-6" />}
                title="Ajusta tu plan de pagos, rápido, sencillo y sin complicaciones."
              />
              <Feature
                icon={<ShieldIcon className="w-6 h-6" />}
                title="Gana control sobre tus finanzas personales con pagos más bajos."
              />
            </div>
          </section>

          {/* Tarjeta derecha */}
          <section className="bg-white rounded-2xl shadow p-6 sm:p-8">
            <form onSubmit={onSubmit} className="max-w-md mx-auto">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center">
                ¡Hola {primerNombre}!
              </h1>
              <p className="text-center text-gray-600 mt-2">
                Accede a la página de arreglo de pagos
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

                {/* Fecha de expiración (debajo de cédula) */}
                <label className="block mt-3">
                  <p className="text-xs text-gray-600 leading-none mb-1">
                    Fecha de expiración de cédula
                  </p>
                  <div className="flex items-center gap-3 border rounded-lg px-3 py-3">
                    <CalendarIcon className="w-5 h-5 text-gray-500" />
                    <input
                      type="date"
                      value={normalizeDisplayDate(docDate) || ''}
                      onChange={(e) => {
                        const isoValue = e.target.value
                        setDocDate(isoValue ? formatDateForDisplay(isoValue) : '')
                        setErrors((prev) => ({ ...prev, docDate: undefined, general: undefined }))
                      }}
                      className="flex-1 bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
                      aria-label="Fecha de expiración del documento"
                    />
                  </div>
                  {expectedDocDate && (
                    <p className="mt-2 text-xs text-gray-500">
                      Fecha registrada: {formatDateForDisplay(expectedDocDate)}
                    </p>
                  )}
                  {errors.docDate && <p className="mt-1 text-xs text-red-600">{errors.docDate}</p>}
                </label>
              </div>

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
                      ? 'bg-yellow-400 hover:bg-yellow-500 text-gray-900'
                      : 'bg-yellow-200 text-gray-500 cursor-not-allowed',
                  ].join(' ')}
                >
                  {isSubmitting ? 'Validando…' : 'Ingresar'}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
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

function normalizeDisplayDate(value) {
  if (!value) return ''
  const parts = value.split('-')
  if (parts.length !== 3) return ''
  const [day, month, year] = parts
  if (day?.length !== 2 || month?.length !== 2 || year?.length !== 4) {
    return ''
  }
  return `${year}-${month}-${day}`
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

function CalendarIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="4.5" width="18" height="16" rx="2.5" stroke="currentColor" />
      <path d="M3 9h18" stroke="currentColor" />
      <path d="M8 3v3M16 3v3" stroke="currentColor" />
    </svg>
  )
}

function ShieldIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 3l7 3v6c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V6l7-3z" stroke="currentColor" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" />
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

function Feature({ icon, title, desc }) {
  return (
    <div className="flex items-start gap-3">
      <div className="shrink-0 text-gray-700">{icon}</div>
      <div>
        <p className="font-medium text-gray-900">{title}</p>
        {desc ? <p className="text-gray-600">{desc}</p> : null}
      </div>
    </div>
  )
}
