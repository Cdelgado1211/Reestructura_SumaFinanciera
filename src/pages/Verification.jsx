import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

const formatCurrency = (value) => {
  if (value == null || value === '') return '—'

  const directNumber = Number(value)
  if (Number.isFinite(directNumber)) {
    return directNumber.toLocaleString('es-PA', { style: 'currency', currency: 'USD' })
  }

  const normalized = Number(String(value).replace(/\s+/g, '').replace(/,/g, '.').replace(/[^0-9.-]/g, ''))
  if (Number.isFinite(normalized)) {
    return normalized.toLocaleString('es-PA', { style: 'currency', currency: 'USD' })
  }

  return String(value)
}

const formatPercent = (value) => {
  if (value == null || value === '') return '—'
  const stringValue = String(value).trim()
  if (stringValue.includes('%')) return stringValue

  const numeric = Number(stringValue.replace(/\s+/g, '').replace(/,/g, '.').replace(/[^0-9.-]/g, ''))
  if (Number.isFinite(numeric)) {
    return `${numeric}%`
  }

  return stringValue
}

const formatMonths = (value) => {
  if (value == null || value === '') return '—'
  const stringValue = String(value).trim()
  const numeric = Number(stringValue.replace(/\s+/g, '').replace(/[^0-9.-]/g, ''))
  if (Number.isFinite(numeric) && numeric !== 0) {
    return `${numeric} meses`
  }

  return stringValue
}

const formatDate = (value) => {
  if (value == null || value === '') return '—'

  const trimmed = String(value).trim()
  if (!trimmed) return '—'

  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (isoMatch) {
    const [, year, month, day] = isoMatch
    return `${day}/${month}/${year}`
  }

  const shortMatch = trimmed.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})$/)
  if (shortMatch) {
    let [, day, month, year] = shortMatch
    if (year.length === 2) {
      year = `20${year}`
    }
    day = day.padStart(2, '0')
    month = month.padStart(2, '0')
    return `${day}/${month}/${year}`
  }

  return trimmed
}

const EMPTY_PLAN = {
  id: null,
  titulo: null,
  fields: {
    cuota: { raw: null, label: null, key: null },
    extension: { raw: null, label: null, key: null },
    tasa: { raw: null, label: null, key: null },
    fecha: { raw: null, label: null, key: null },
  },
}

const parseJSON = (value) => {
  if (!value) return null
  try {
    return JSON.parse(value)
  } catch (error) {
    console.error('No se pudo interpretar un valor almacenado', error)
    return null
  }
}

const resolveFieldValue = (field, record) => {
  if (!field) return undefined

  if (field.label && field.label !== '—') {
    return field.label
  }

  if (field.raw != null && field.raw !== '') {
    return field.raw
  }

  if (!record || !field.key) {
    return undefined
  }

  if (Array.isArray(field.key)) {
    for (const key of field.key) {
      const candidate = record?.[key]
      if (candidate != null && candidate !== '') {
        return candidate
      }
    }
    return undefined
  }

  return record?.[field.key]
}

export default function Verification() {
  const navigate = useNavigate()

  const storedPlan = useMemo(
    () => parseJSON(localStorage.getItem('banistmo:selectedPlan')) || EMPTY_PLAN,
    [],
  )
  const record = useMemo(
    () => parseJSON(localStorage.getItem('banistmo:clienteData')),
    [],
  )

  const displayPlan = useMemo(() => {
    const extension = resolveFieldValue(storedPlan.fields?.extension, record)
    const tasa = resolveFieldValue(storedPlan.fields?.tasa, record)
    const cuota = resolveFieldValue(storedPlan.fields?.cuota, record)
    const fecha = resolveFieldValue(storedPlan.fields?.fecha, record)

    return {
      extension: formatMonths(extension),
      tasa: formatPercent(tasa),
      cuota: formatCurrency(cuota),
      fecha: formatDate(fecha),
    }
  }, [record, storedPlan])

  const hasPlanSelection = Boolean(storedPlan?.id)

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

          {hasPlanSelection ? (
            <div className="mt-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
              Confirmaste el <span className="font-semibold">{storedPlan.titulo}</span>. Revisa los
              detalles antes de continuar.
            </div>
          ) : (
            <div className="mt-3 text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
              Selecciona un plan para continuar con la verificación.
            </div>
          )}

          {/* Sub-tarjeta: Información del préstamo */}
          <div className="mt-6 rounded-2xl border border-gray-200 p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-3">Información del préstamo</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-600">Extensión del plazo</div>
                <div className="text-lg font-bold text-gray-900">{displayPlan.extension}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Tasa de interés</div>
                <div className="text-lg font-bold text-gray-900">{displayPlan.tasa}</div>
              </div>
            </div>
          </div>

          {/* Sub-tarjeta: Datos del período */}
          <div className="mt-4 rounded-2xl border border-gray-200 p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-3">Datos del período</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-600">Próxima letra a pagar</div>
                <div className="text-lg font-bold text-gray-900">{displayPlan.cuota}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Próxima fecha de pago</div>
                <div className="text-lg font-bold text-gray-900">{displayPlan.fecha}</div>
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
              disabled={!hasPlanSelection}
              className={[
                'px-6 py-2.5 rounded-full font-semibold transition-colors',
                hasPlanSelection
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
