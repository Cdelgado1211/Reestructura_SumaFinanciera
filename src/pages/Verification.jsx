import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { buildPathWithDana, getDanaParamFromSearch, persistDanaParam } from '../utils/dana'

const parseCurrencyNumber = (value) => {
  if (value == null || value === '') return null

  const directNumber = Number(value)
  if (Number.isFinite(directNumber)) {
    return directNumber
  }

  const normalized = Number(String(value).replace(/\s+/g, '').replace(/,/g, '.').replace(/[^0-9.-]/g, ''))
  if (Number.isFinite(normalized)) {
    return normalized
  }

  return null
}

const formatCurrency = (value) => {
  const numeric = parseCurrencyNumber(value)

  if (numeric == null) {
    const stringValue = value != null ? String(value).trim() : ''
    return stringValue ? stringValue : '—'
  }

  const formatted = Math.abs(numeric).toLocaleString('es-PA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return `${numeric < 0 ? '-' : ''}$${formatted}`
}

const formatPercent = (value) => {
  if (value == null || value === '') return '—'
  const stringValue = String(value).trim()

  if (/anual/i.test(stringValue)) {
    return stringValue
  }

  if (stringValue.includes('%')) {
    return `${stringValue.replace(/%+\s*$/, '').trim()}% anual`
  }

  const numeric = Number(stringValue.replace(/\s+/g, '').replace(/,/g, '.').replace(/[^0-9.-]/g, ''))
  if (Number.isFinite(numeric)) {
    return `${numeric}% anual`
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

const MONTH_NAMES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
]

const formatDate = (value) => {
  if (value == null || value === '') return '—'

  const trimmed = String(value).trim()
  if (!trimmed) return '—'

  const buildLabel = (year, month, day) => {
    const monthIndex = Number(month) - 1
    const monthName = MONTH_NAMES[monthIndex]
    const dayNumber = Number(day)
    const yearNumber = Number(year)

    if (!monthName || !Number.isFinite(dayNumber) || !Number.isFinite(yearNumber)) {
      return null
    }

    return `${dayNumber} de ${monthName} de ${yearNumber}`
  }

  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (isoMatch) {
    const [, year, month, day] = isoMatch
    const label = buildLabel(year, month, day)
    if (label) {
      return label
    }
  }

  const shortMatch = trimmed.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})$/)
  if (shortMatch) {
    let [, day, month, year] = shortMatch
    if (year.length === 2) {
      year = `20${year}`
    }
    const label = buildLabel(year, month, day)
    if (label) {
      return label
    }
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

const resolveFieldDetails = (field, record) => {
  if (!field) {
    return { value: undefined, key: undefined }
  }

  const deriveKey = () => {
    if (!field.key) return undefined

    if (Array.isArray(field.key)) {
      if (record) {
        for (const key of field.key) {
          const candidate = record?.[key]
          if (candidate != null && candidate !== '') {
            if (field.raw != null && field.raw !== '' && candidate === field.raw) {
              return key
            }
            if (!field.raw && field.label && field.label !== '—' && String(candidate) === field.label) {
              return key
            }
          }
        }
      }

      return field.key[0]
    }

    return field.key
  }

  const key = deriveKey()

  if (field.raw != null && field.raw !== '') {
    return { value: field.raw, key }
  }

  if (field.label && field.label !== '—') {
    return { value: field.label, key }
  }

  if (!record || !key) {
    return { value: undefined, key }
  }

  if (Array.isArray(field.key)) {
    for (const candidateKey of field.key) {
      const candidate = record?.[candidateKey]
      if (candidate != null && candidate !== '') {
        return { value: candidate, key: candidateKey }
      }
    }
    return { value: undefined, key }
  }

  return { value: record?.[key], key }
}

export default function Verification() {
  const navigate = useNavigate()
  const location = useLocation()
  const [danaParam, setDanaParam] = useState('')

  const storedPlan = useMemo(
    () => parseJSON(localStorage.getItem('banistmo:selectedPlan')) || EMPTY_PLAN,
    [],
  )
  const record = useMemo(
    () => parseJSON(localStorage.getItem('banistmo:clienteData')),
    [],
  )

  useEffect(() => {
    const danaValue = getDanaParamFromSearch(location.search)
    if (!danaValue) {
      setDanaParam('')
      navigate('/error', { replace: true })
      return
    }

    setDanaParam(danaValue)
    persistDanaParam(danaValue)

    if (!storedPlan?.id) {
      navigate(buildPathWithDana('/plan', danaValue), { replace: true })
      return
    }
  }, [location.search, navigate, storedPlan])

  const generalInfo = useMemo(
    () => ({
      saldo: formatCurrency(record?.SALDOCAPITAL),
      letraActual: formatCurrency(record?.LETRA_COMPLETA),
      montoVencido: formatCurrency(record?.TOTALVENC_POST),
      producto: record?.PRODUCTO || '—',
      numeroCredito: record?.NUMCRED || '—',
      plazoActual: record?.PLAZO_CONTRATADO || '—',
      tasaActual: formatPercent(record?.TASA_COBROS),
    }),
    [record],
  )

  const displayPlan = useMemo(() => {
    const extension = resolveFieldDetails(storedPlan.fields?.extension, record)
    const tasa = resolveFieldDetails(storedPlan.fields?.tasa, record)
    const cuota = resolveFieldDetails(storedPlan.fields?.cuota, record)
    const fecha = resolveFieldDetails(storedPlan.fields?.fecha, record)

    return { extension, tasa, cuota, fecha }
  }, [record, storedPlan])

  const hasPlanSelection = Boolean(storedPlan?.id)

  const onCancel = () => navigate(buildPathWithDana('/plan', danaParam))
  const onConfirm = () => {
    if (!hasPlanSelection || !danaParam) {
      return
    }

    navigate(buildPathWithDana('/contrato', danaParam))
  }

  return (
    <div className="py-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Tarjeta maestro */}
        <div className="bg-white rounded-2xl shadow p-5 md:p-6">
          <Stepper current={2} />

          <h1 className="mt-4 text-2xl font-semibold text-gray-900">Reestructuración de deuda</h1>
          <p className="text-gray-600">Verifica la información del nuevo plan de pagos</p>

          {!hasPlanSelection && (
            <div className="mt-3 text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
              Selecciona un plan para continuar con la verificación.
            </div>
          )}

          {/* Información del préstamo actual */}
          <div className="mt-6">
            <div className="rounded-2xl border border-gray-200 p-6">
              <h2 className="text-base font-semibold text-gray-900">Información del préstamo actual</h2>

              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                {[
                  { label: 'Saldo total actual:', value: generalInfo.saldo },
                  { label: 'Letra actual', value: generalInfo.letraActual },
                  { label: 'Monto vencido', value: generalInfo.montoVencido },
                  { label: 'Producto', value: generalInfo.producto },
                  { label: 'N° de Crédito', value: generalInfo.numeroCredito },
                  { label: 'Plazo actual', value: generalInfo.plazoActual },
                  { label: 'Tasa actual', value: generalInfo.tasaActual },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="text-sm text-gray-600">{item.label}</div>
                    <div className="mt-1 text-base font-semibold text-gray-900">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Información del préstamo */}
          <div className="mt-6">
            <div className="rounded-2xl border border-gray-200 p-6">
              <h2 className="text-base font-semibold text-gray-900">Información del préstamo</h2>

              <div className="mt-6 space-y-6">
                <div>
                  <div className="text-sm text-gray-600">Nuevo plazo</div>
                  <div className="mt-1 text-base font-semibold text-gray-900">
                  {hasPlanSelection
                    ? formatMonths(displayPlan.extension.value)
                    : generalInfo.plazoActual || '--'}
                  </div>
                  <div className="text-[11px] leading-[15px] text-gray-500 mt-1">(Letras por pagar + Extensión)</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Tasa de interés</div>
                  <div className="mt-1 text-base font-semibold text-gray-900">
                    {hasPlanSelection ? formatPercent(displayPlan.tasa.value) : generalInfo.tasaActual || '--'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Próxima letra a pagar</div>
                  <div className="mt-1 text-base font-semibold text-gray-900">
                    {hasPlanSelection
                      ? formatCurrency(displayPlan.cuota.value)
                      : generalInfo.letraActual || '--'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Datos del período */}
          <div className="mt-6">
            <div className="rounded-2xl border border-gray-200 p-6">
              <h2 className="text-base font-semibold text-gray-900">Datos del período</h2>

              <div className="mt-6 space-y-6">
                <div>
                  <div className="text-sm text-gray-600">Próxima letra a pagar</div>
                  <div className="mt-1 text-base font-semibold text-gray-900">
                    {hasPlanSelection
                      ? formatCurrency(displayPlan.cuota.value)
                      : generalInfo.letraActual || '--'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Próxima fecha de pago</div>
                  <div className="mt-1 text-base font-semibold text-gray-900">
                    {hasPlanSelection ? formatDate(displayPlan.fecha.value) : '--'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pregunta + acciones */}
          <p className="mt-6 text-gray-700">¿Confirmas la reestructuración de la deuda?</p>

          <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={onConfirm}
              disabled={!hasPlanSelection || !danaParam}
              className={[
                'px-6 py-2.5 rounded-full font-semibold transition-colors sm:order-2',
                hasPlanSelection && danaParam
                  ? 'bg-yellow-400 hover:bg-yellow-500 text-gray-900'
                  : 'bg-yellow-200 text-gray-500 cursor-not-allowed',
              ].join(' ')}
            >
              Confirmar
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 sm:order-1"
            >
              Cancelar
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
    { id: 3, label: 'Disposiciones legales' },
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
