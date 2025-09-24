import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Verification() {
  const navigate = useNavigate()

  // Defaults por si no hay nada en localStorage
  const defaultPlan = { id: 'p2', titulo: 'Plan 2', cuota: 184.8, ext: 24, tasa: '10%', fecha: '30 ene 2024' }

  const plan = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('banistmo:selectedPlan')) || defaultPlan }
    catch { return defaultPlan }
  }, [])

  const formatCurrency = (n) =>
    new Intl.NumberFormat('es-PA', { style: 'currency', currency: 'USD' }).format(Number(n || 0))

  const expandEsMonth = (txt) => {
    // convierte "30 ene 2024" -> "30 enero 2024" si viene abreviado
    const map = { ene: 'enero', feb: 'febrero', mar: 'marzo', abr: 'abril', may: 'mayo', jun: 'junio',
                  jul: 'julio', ago: 'agosto', sep: 'septiembre', oct: 'octubre', nov: 'noviembre', dic: 'diciembre' }
    const m = String(txt).match(/^(\d{1,2})\s+([a-zñ]{3})\s+(\d{4})$/i)
    if (!m) return txt
    return `${m[1]} ${map[m[2].toLowerCase()] || m[2]} ${m[3]}`
  }

  const onCancel = () => navigate('/plan')
  const onConfirm = () => navigate('/contrato')

  return (
    <div className="py-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Tarjeta maestro */}
        <div className="bg-white rounded-2xl shadow p-5 md:p-6">
          <Stepper current={2} />

          <h1 className="mt-4 text-2xl font-semibold text-gray-900">Reestructuración de deuda</h1>
          <p className="text-gray-600">
            Verifica la información del nuevo plan de pagos de tu préstamo
          </p>

          {/* Sub-tarjeta: Información del préstamo */}
          <div className="mt-6 rounded-2xl border border-gray-200 p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-3">Información del préstamo</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-600">Extensión del plazo</div>
                <div className="text-lg font-bold text-gray-900">{plan.ext} meses</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Tasa de interés</div>
                <div className="text-lg font-bold text-gray-900">{plan.tasa}</div>
              </div>
            </div>
          </div>

          {/* Sub-tarjeta: Datos del período */}
          <div className="mt-4 rounded-2xl border border-gray-200 p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-3">Datos del período</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-600">Próxima letra a pagar</div>
                <div className="text-lg font-bold text-gray-900">{formatCurrency(plan.cuota)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Próxima fecha de pago</div>
                <div className="text-lg font-bold text-gray-900">{expandEsMonth(plan.fecha)}</div>
              </div>
            </div>
          </div>

          {/* Pregunta + acciones */}
          <p className="mt-6 text-gray-700">¿Confirmas la reestructuración de la deuda?</p>

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
              className="px-6 py-2.5 rounded-full font-semibold bg-yellow-400 hover:bg-yellow-500 text-gray-900 transition-colors"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* =================== Stepper (igual estilo que el de PlanSelection) =================== */
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
    <div className="mb-4">
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
