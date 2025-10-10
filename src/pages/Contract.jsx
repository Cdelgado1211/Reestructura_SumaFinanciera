import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { buildPathWithDana, getDanaParamFromSearch, persistDanaParam } from '../utils/dana'

export default function Contract() {
  const navigate = useNavigate()
  const location = useLocation()
  const [danaParam, setDanaParam] = useState('')
  const [accepted, setAccepted] = useState(false)

  useEffect(() => {
    const danaValue = getDanaParamFromSearch(location.search)
    if (!danaValue) {
      setDanaParam('')
      navigate('/error', { replace: true })
      return
    }

    setDanaParam(danaValue)
    persistDanaParam(danaValue)
  }, [location.search, navigate])

  const onCancel = () => navigate(buildPathWithDana('/verificacion', danaParam))
  const onConfirm = (e) => {
    e.preventDefault()
    if (!accepted) return
    navigate(buildPathWithDana('/ajustando', danaParam)) // siguiente pantalla: “Un momento…”
  }

  return (
    <div className="py-0">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Tarjeta maestro a alto de viewport */}
        <div className="bg-white sm:rounded-2xl shadow h-screen sm:h-[calc(100vh-2rem)] sm:my-4 flex flex-col">
          {/* Header */}
          <div className="p-5 md:p-6">
            <Stepper current={3} />

            <h1 className="mt-4 text-2xl font-semibold text-gray-900">
              Reestructuración de deuda
            </h1>
            <p className="text-gray-600">
              Lee y acepta los términos y condiciones
            </p>
          </div>

          {/* Contenido scrollable (flex-1) */}
          <div className="px-5 md:px-6">
            <div className="rounded-2xl border border-gray-200">
              <div
                className="rounded-xl bg-white max-h-[60vh] sm:max-h-[58vh] overflow-y-auto p-6 pr-4"
                aria-label="Términos y condiciones (desplázate para leer)"
              >
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

                {/* --- contenido extra de ejemplo para forzar scroll --- */}
                <div className="prose-sm text-sm text-gray-800 mt-4 space-y-3">
                  <p>1. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed posuere, nibh non bibendum porta, urna nisl vulputate lorem, sed aliquet ipsum augue nec turpis.</p>
                  <p>2. Integer accumsan, augue non scelerisque feugiat, urna lacus convallis ipsum, vel sagittis nisl quam id risus. Donec id cursus orci.</p>
                  <p>3. Suspendisse potenti. Fusce imperdiet ante sed massa molestie, vitae vestibulum nisl efficitur. Sed id sem at arcu convallis facilisis.</p>
                  <p>4. Curabitur facilisis, sapien eu venenatis rhoncus, justo risus feugiat mi, non placerat massa lacus id nunc. Integer viverra, leo non luctus gravida, lorem sem vehicula nisl, non luctus neque lorem a lacus.</p>
                  <p>5. Nulla facilisi. Donec nec fringilla neque. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.</p>
                  <p>6. Vivamus faucibus, mauris ut tristique consectetur, nunc nisi posuere lorem, non varius augue libero sit amet odio. In interdum, nibh ac tristique tempor, erat sem fermentum urna, non pretium eros arcu nec nisi.</p>
                  <p>7. Phasellus dictum, arcu id fermentum facilisis, lacus magna scelerisque neque, sed viverra lectus sapien at tortor. Sed a pulvinar nibh.</p>
                  <p>8. Aliquam erat volutpat. Duis interdum varius est, non fermentum ipsum posuere ac. Nunc porttitor, magna id ultricies volutpat, arcu risus viverra risus, quis volutpat risus ipsum in neque.</p>
                  <p>9. Donec sed ante nec nunc pellentesque ultrices. Praesent eget felis id mi euismod faucibus. Pellentesque sit amet eleifend sapien.</p>
                  <p>10. Etiam id massa consequat, finibus lectus at, porta lorem. Donec sed mi sem. Etiam facilisis hendrerit felis vitae vehicula.</p>
                </div>

                {/* Espaciador para que el final sea claro */}
                <div className="h-6" />
              </div>
            </div>
          </div>

          {/* Footer fijo dentro de la tarjeta: checkbox + acciones */}
          <div className="px-5 md:px-6 pb-6 sm:pb-8 pt-4 mt-auto border-t border-gray-100 bg-white">
            <label className="flex items-start gap-3 text-sm">
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

            <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center">
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
    </div>
  )
}

/* ===== Stepper unificado (línea base + progreso + puntos; etiquetas debajo) ===== */
function Stepper({ current = 1 }) {
  const steps = [
    { id: 1, label: 'Plan de pago' },
    { id: 2, label: 'Verificación' },
    { id: 3, label: 'Contrato' },
  ]

  const total = steps.length
  const idx = Math.min(Math.max(current, 1), total)
  const progressPercent = total > 1 ? ((idx - 1) / (total - 1)) * 100 : 0

  return (
    <div className="mb-2">
      {/* Línea base + progreso */}
      <div className="relative h-8">
        {/* Línea gris */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[3px] bg-gray-200 rounded" />
        {/* Línea verde de progreso */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-[3px] bg-emerald-500 rounded transition-all"
          style={{ width: `${progressPercent}%` }}
        />
        {/* Puntos */}
        {steps.map((s, i) => {
          const left = (i / (total - 1)) * 100
          const isActive = s.id === idx
          const isDone = s.id < idx

          return (
            <div
              key={s.id}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
              style={{ left: `${left}%` }}
            >
              <div
                className={[
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border transition-colors',
                  isActive
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : isDone
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-500'
                      : 'bg-gray-100 text-gray-600 border-gray-300'
                ].join(' ')}
              >
                {s.id}
              </div>
            </div>
          )
        })}
      </div>

      {/* Etiquetas debajo */}
      <div className="mt-2 grid grid-cols-3 text-sm text-gray-600">
        <div className="text-left">{steps[0].label}</div>
        <div className="text-center">{steps[1].label}</div>
        <div className="text-right">{steps[2].label}</div>
      </div>
    </div>
  )
}
