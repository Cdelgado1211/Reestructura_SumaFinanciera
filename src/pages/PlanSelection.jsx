import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { isServiceErrorResponse } from '../utils/serviceResponse'
import { buildPathWithDana, getDanaParamFromSearch, persistDanaParam } from '../utils/dana'

const LAMBDA_ENDPOINT = 'https://3nift3okknzemzfp7y4u57q6ne0lwfnj.lambda-url.us-east-1.on.aws/'

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
  if (stringValue.includes('%')) return stringValue

  const numeric = Number(stringValue.replace(/\s+/g, '').replace(/,/g, '.').replace(/[^0-9.-]/g, ''))
  if (Number.isFinite(numeric)) {
    return `${numeric}%`
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

const formatMonths = (value) => {
  if (value == null || value === '') return '—'
  const stringValue = String(value).trim()
  const numeric = Number(stringValue.replace(/\s+/g, '').replace(/[^0-9.-]/g, ''))
  if (Number.isFinite(numeric) && numeric !== 0) {
    return `${numeric} meses`
  }

  return stringValue
}

export default function PlanSelection() {
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [danaParam, setDanaParam] = useState('')

  useEffect(() => {
    const storedData = localStorage.getItem('banistmo:clienteData')
    if (storedData) {
      try {
        setRecord(JSON.parse(storedData))
      } catch (parseError) {
        console.error('No se pudo leer la información guardada del cliente', parseError)
      }
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const danaValue = getDanaParamFromSearch(location.search)

    if (!danaValue) {
      setDanaParam('')
      navigate('/error', { replace: true })
      return () => controller.abort()
    }

    setDanaParam(danaValue)
    persistDanaParam(danaValue)

    const fetchPlanData = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(
          `${LAMBDA_ENDPOINT}?dana=${encodeURIComponent(danaValue)}&s=a`,
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

        if (data?.record) {
          setRecord(data.record)
          try {
            localStorage.setItem('banistmo:clienteData', JSON.stringify(data.record))
          } catch (storageError) {
            console.error('No se pudo guardar la información del cliente', storageError)
          }
        }
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') {
          console.error('No se pudo obtener la información del plan', fetchError)
          setError('No se pudo obtener la información más reciente. Intenta nuevamente en unos minutos.')
          navigate('/error', { replace: true })
        }
      } finally {
        setLoading(false)
      }
    }

    fetchPlanData()

    return () => controller.abort()
  }, [location.search, navigate])

  const generalInfo = useMemo(
    () => ({
      saldo: formatCurrency(record?.SALDOCAPITAL),
      producto: record?.PRODUCTO || '—',
      plazo: record?.PLAZO_CONTRATADO || '—',
      montoVencido: formatCurrency(record?.TOTALVENC_POST),
      numeroCredito: record?.NUMCRED || '—',
      tasaActual: formatPercent(record?.TASA_COBROS),
      letraActual: formatCurrency(record?.LETRA_COMPLETA),
    }),
    [record],
  )

  const plans = useMemo(() => {
    if (!record) return []

    const resolveValue = (keys) => {
      if (Array.isArray(keys)) {
        for (const key of keys) {
          const value = record?.[key]
          if (value != null && value !== '') {
            return { value, key }
          }
        }

        return { value: undefined, key: keys[0] }
      }

      return { value: record?.[keys], key: keys }
    }

    const planDefinitions = [
      {
        id: 'plan1',
        titulo: 'Plan 1',
        cuotaKey: 'CUOTA_FINAL_1',
        extensionKey: 'PLAZO_OFERTA_1',
        tasaKey: 'TASA_OFERTA_1',
        fechaKeys: ['FECHA_PAGO_1', 'FECHA_PAGO_3', 'FECHA_PAGO_2'],
      },
      {
        id: 'plan2',
        titulo: 'Plan 2',
        cuotaKey: 'CUOTA_FINAL_2',
        extensionKey: 'PLAZO_OFERTA_2',
        tasaKey: 'TASA_OFERTA_2',
        fechaKeys: ['FECHA_PAGO_2', 'FECHA_PAGO_1', 'FECHA_PAGO_3'],
      },
      {
        id: 'plan3',
        titulo: 'Plan 3',
        cuotaKey: 'CUOTA_FINAL_3',
        extensionKey: 'PLAZO_OFERTA_3',
        tasaKey: 'TASA_OFERTA_3',
        fechaKeys: ['FECHA_PAGO_3', 'FECHA_PAGO_2', 'FECHA_PAGO_1'],
      },
    ]

    return planDefinitions
      .map((definition) => {
        const cuota = resolveValue(definition.cuotaKey)
        const extension = resolveValue(definition.extensionKey)
        const tasa = resolveValue(definition.tasaKey)
        const fecha = resolveValue(definition.fechaKeys)

        const cuotaLabel = formatCurrency(cuota.value)
        const extLabel = formatMonths(extension.value)
        const tasaLabel = formatPercent(tasa.value)
        const fechaLabel = formatDate(fecha.value)

        if (cuotaLabel === '—' && extLabel === '—' && tasaLabel === '—' && fechaLabel === '—') {
          return null
        }

        return {
          ...definition,
          cuotaRaw: cuota.value,
          cuotaKey: cuota.key,
          extensionRaw: extension.value,
          extensionKeyUsed: extension.key,
          tasaRaw: tasa.value,
          tasaKey: tasa.key,
          fechaRaw: fecha.value,
          fechaKey: fecha.key,
          cuotaLabel,
          extLabel,
          tasaLabel,
          fechaLabel,
        }
      })
      .filter(Boolean)
  }, [record])

  useEffect(() => {
    if (plans.length > 0) {
      setSelectedPlan((prev) => (prev && plans.some((plan) => plan.id === prev) ? prev : plans[0].id))
    }
  }, [plans])

  const onContinuar = () => {
    if (!selectedPlan) return

    const plan = plans.find((item) => item.id === selectedPlan)

    if (plan) {
      const payload = {
        id: plan.id,
        titulo: plan.titulo,
        fields: {
          cuota: {
            raw: plan.cuotaRaw,
            label: plan.cuotaLabel,
            key: plan.cuotaKey,
          },
          extension: {
            raw: plan.extensionRaw,
            label: plan.extLabel,
            key: plan.extensionKeyUsed,
          },
          tasa: {
            raw: plan.tasaRaw,
            label: plan.tasaLabel,
            key: plan.tasaKey,
          },
          fecha: {
            raw: plan.fechaRaw,
            label: plan.fechaLabel,
            key: plan.fechaKey,
          },
        },
      }

      try {
        localStorage.setItem('banistmo:selectedPlan', JSON.stringify(payload))
      } catch (storageError) {
        console.error('No se pudo guardar el plan seleccionado', storageError)
      }
    }

    navigate(buildPathWithDana('/verificacion', danaParam))
  }

  return (
    <div className="py-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Tarjeta maestro */}
        <div className="bg-white rounded-2xl shadow p-5 md:p-6">
          {/* Stepper */}
          <Stepper current={1} />

          {/* Título + intro */}
          <div className="mt-3">
            <h1 className="text-lg md:text-xl font-semibold text-gray-900">Reestructuración de deuda</h1>
            <p className="text-gray-600 text-sm">
              Bienvenido, aquí podrás reestructurar tus pagos y ponerte al día con tu préstamo.
            </p>
          </div>

          {/* Nombre */}
          <div className="mt-4">
            <div className="rounded-xl border border-gray-200 px-4 py-3 bg-white">
              <label className="block text-sm text-gray-700 mb-1">Nombre</label>
              {record?.nombre || '—'}
            </div>
          </div>

          {/* Información de tu préstamo actual (una sola tarjeta, sin sub-cards) */}
          <div className="mt-6">
            <h2 className="text-sm font-medium text-gray-900 mb-3">
              Información de tu préstamo actual
            </h2>

            <div className="rounded-2xl border border-gray-200 p-6">
              <div>
                <div className="text-sm text-gray-600">Saldo total actual</div>
                <div className="text-3xl font-extrabold text-gray-900 mt-1">{generalInfo.saldo}</div>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
                <InfoField label="Producto" value={generalInfo.producto} />
                <InfoField label="Plazo" value={generalInfo.plazo} />
                <InfoField label="Monto vencido" value={generalInfo.montoVencido} />
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
                <InfoField label="No. de crédito" value={generalInfo.numeroCredito} />
                <InfoField label="Tasa actual" value={generalInfo.tasaActual} />
                <InfoField label="Letra actual" value={generalInfo.letraActual} />
              </div>
            </div>
          </div>

          {/* Opciones */}
          <div className="mt-5">
            <h2 className="text-sm font-medium text-gray-900 mb-3">Opciones de reestructuración de la deuda</h2>

            {loading && (
              <p className="text-sm text-gray-500 mb-3">Cargando opciones de reestructuración…</p>
            )}

            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  checked={selectedPlan === plan.id}
                  onSelect={() => setSelectedPlan(plan.id)}
                />
              ))}
            </div>

            {!loading && !error && plans.length === 0 && (
              <p className="text-sm text-gray-600 mt-3">
                No hay planes disponibles en este momento. Intenta nuevamente más tarde.
              </p>
            )}

            {/* Botones */}
            <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center ">
              <button
                type="button"
                onClick={() => navigate(buildPathWithDana('/', danaParam))}
                className="px-6 py-2.5 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!selectedPlan}
                onClick={onContinuar}
                className={[
                  'px-6 py-2.5 rounded-full font-semibold transition-colors',
                  selectedPlan
                    ? 'bg-yellow-400 hover:bg-yellow-500 text-gray-900'
                    : 'bg-yellow-200 text-gray-500 cursor-not-allowed',
                ].join(' ')}
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoField({ label, value }) {
  return (
    <div>
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-base font-semibold text-gray-900 mt-1">{value}</div>
    </div>
  )
}

/* ------------ Stepper nuevo (estilo igual al screenshot) ------------ */
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
          const left = total > 1 ? (i / (total - 1)) * 100 : 0
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
                      : 'bg-gray-100 text-gray-600 border-gray-300',
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

/* ------------ PlanCard e iconos ------------ */
function PlanCard({ plan, checked, onSelect }) {
  return (
    <label
      className={[
        'relative block rounded-2xl border-2 bg-white p-4 cursor-pointer transition-shadow',
        checked ? 'border-yellow-400 ring-2 ring-yellow-300 shadow-md' : 'border-gray-200 hover:shadow',
      ].join(' ')}
      onClick={onSelect}
    >
      {/* círculo/check en esquina derecha */}
      <span
        className={[
          'absolute top-3 right-3 w-5 h-5 rounded-full border flex items-center justify-center',
          checked ? 'bg-yellow-400 border-yellow-400' : 'border-gray-300 bg-white',
        ].join(' ')}
      >
        {checked ? <CheckIcon /> : null}
      </span>

      <div className="text-xs text-gray-600">{plan.titulo}</div>
      <div className="text-2xl font-extrabold text-gray-900">{plan.cuotaLabel}</div>
      <div className="text-xs text-gray-500">Letra mensual</div>

      <ul className="mt-3 space-y-2 text-sm text-gray-800">
        <li className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
            <IconAlarm />
          </span>
          <span>
            Nuevo plazo <strong>{plan.extLabel}</strong>
          </span>
        </li>
        <li className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
            <IconPlant />
          </span>
          <span>
            Tasa de interés anual <strong>{plan.tasaLabel}</strong>
          </span>
        </li>
        <li className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
            <IconCalendar />
          </span>
          <span>
            Próxima fecha de pago <strong>{plan.fechaLabel}</strong>
          </span>
        </li>
      </ul>
    </label>
  )
}

/* ------------ Iconos (24px máx) ------------ */
function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 12l4 4 8-8" stroke="white" strokeWidth="2" />
    </svg>
  )
}
function IconAlarm() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="text-gray-600"
    >
      <circle cx="12" cy="13" r="6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 10.5V13l2 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path
        d="M7.2 5.1 5 3 3 5l2.2 2.2M16.8 5.1 19 3l2 2-2.2 2.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M9 19l-1.5 1.8M15 19l1.5 1.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
function IconPlant() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="text-gray-600"
    >
      <path
        d="M12 20v-7.5c0-2.5 1.7-4.7 4.1-5.4 1.5-.4 3.3-.4 4.9.6-1 3-3.4 4.8-5.8 4.8h-1.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 12.5c0-2.5-1.7-4.7-4.1-5.4-1.5-.4-3.3-.4-4.9.6 1 3 3.4 4.8 5.8 4.8H9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 20c0-1.5-1-2.5-2.5-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M12 20c0-1.5 1-2.5 2.5-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
function IconCalendar() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="text-gray-600"
    >
      <rect x="4" y="5" width="16" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 9.5h16" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 3.5v3M15 3.5v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="9" y="12" width="2.8" height="2.8" rx="0.6" fill="currentColor" />
    </svg>
  )
}
