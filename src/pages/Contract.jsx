import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Contract() {
  const navigate = useNavigate()
  const [accepted, setAccepted] = useState(false)

  const onCancel = () => navigate('/verificacion')
  const onConfirm = (e) => {
    e.preventDefault()
    if (!accepted) return
    navigate('/ajustando') // siguiente pantalla: “Un momento…”
  }

  return (
    <div className="py-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Tarjeta maestro */}
        <div className="bg-white rounded-2xl shadow p-5 md:p-6">
          <Stepper current={3} />

          <h1 className="mt-4 text-2xl font-semibold text-gray-900">
            Reestructuración de deuda
          </h1>
          <p className="text-gray-600">
            Lee y acepta los términos y condiciones
          </p>

          {/* Caja scrollable con T&C (como panel dentro de la tarjeta) */}
          <div className="mt-6">
            <div className="rounded-2xl border border-gray-200 p-4">
              <div className="rounded-xl bg-white shadow max-h-80 overflow-auto p-6">
                <h3 className="text-center font-semibold">Términos y condiciones</h3>
                <p className="text-center text-xs text-gray-600 mb-4">
                  Contrato único de productos y servicios
                </p>

                <p className="text-sm text-gray-800 mb-3"><strong>DEFINICIONES</strong></p>
                <p className="text-sm text-gray-800 mb-3">
                  Para todos los efectos de este contrato los términos detallados a continuación se
                  entenderán como siguen:
                </p>
                <p className="text-sm text-gray-800 mb-3">
                  <strong>Aceptación Electrónica:</strong> se refiere al uso de los elementos de
                  identificación y autenticación de EL CLIENTE para operar dentro de los sistemas
                  de BANCA ELECTRÓNICA, equivalentes a la aceptación de las instrucciones dadas
                  ayudando a establecer una relación entre las instrucciones y la identidad del CLIENTE.
                </p>
                <p className="text-sm text-gray-800">
                  <strong>Banco:</strong> se entiende como BANISTMO, S.A.
                </p>
                {/* … agrega el resto del texto real aquí si lo necesitas … */}
              </div>
            </div>
          </div>

          {/* Aceptación */}
          <label className="mt-6 flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
            />
            <span className="text-gray-800">
              Aceptar <strong>Términos y condiciones</strong>
            </span>
          </label>

          {/* Acciones */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={!accepted}
              className={[
                'px-6 py-2.5 rounded-full font-semibold transition-colors',
                accepted
                  ? 'bg-yellow-400 hover:bg-yellow-500 text-gray-900'
                  : 'bg-yellow-200 text-gray-500 cursor-not-allowed',
              ].join(' ')}
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ===== Stepper: 1 y 2 completados, 3 activo; etiquetas debajo ===== */
function Stepper({ current }) {
  const steps = [
    { id: 1, label: 'Plan de pago' },
    { id: 2, label: 'Verificación' },
    { id: 3, label: 'Contrato' },
  ]

  return (
    <div className="w-full">
      <div className="grid grid-cols-3 gap-4">
        {steps.map((s, idx) => {
          const isActive = s.id === current
          const isDone = s.id < current
          const showBar = idx < steps.length - 1

          return (
            <div key={s.id} className="relative flex flex-col items-center">
              <div
                className={[
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border',
                  isActive
                    ? 'bg-green-500 text-white border-green-500'
                    : isDone
                      ? 'bg-green-100 text-green-700 border-green-500'
                      : 'bg-gray-200 text-gray-700 border-gray-300',
                ].join(' ')}
              >
                {s.id}
              </div>

              {/* barra hacia el siguiente (para el último no se pinta) */}
              {showBar && (
                <div className="absolute top-1/2 -translate-y-1/2 left-1/2 right-0 h-1 rounded bg-gray-200 overflow-hidden">
                  <div
                    className="h-1 bg-green-500 rounded"
                    style={{ width: current > s.id ? '100%' : current === s.id ? '100%' : '0%' }}
                  />
                </div>
              )}

              <div className="mt-2 text-xs sm:text-sm text-gray-700 text-center">
                {s.label}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
