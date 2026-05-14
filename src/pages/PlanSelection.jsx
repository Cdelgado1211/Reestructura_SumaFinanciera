import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { isServiceErrorResponse } from '../utils/serviceResponse'
import { buildPathWithDana, getDanaParamFromSearch, persistDanaParam } from '../utils/dana'

const LAMBDA_ENDPOINT = 'https://lp5h7egegt2wlrfpur4egp6jge0hwvmy.lambda-url.us-east-1.on.aws/'

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

const formatMonths = (value) => {
  if (value == null || value === '') return '—'
  const stringValue = String(value).trim()
  const numeric = Number(stringValue.replace(/\s+/g, '').replace(/[^0-9.-]/g, ''))
  if (Number.isFinite(numeric) && numeric !== 0) {
    return `${numeric} meses`
  }

  return stringValue
}

const parseInteger = (value) => {
  if (value == null || value === '') return null
  const numeric = Number(String(value).replace(/\s+/g, '').replace(/[^0-9.-]/g, ''))
  if (!Number.isFinite(numeric)) {
    return null
  }

  const rounded = Math.round(numeric)
  return rounded > 0 ? rounded : null
}

const parsePercentNumber = (value) => {
  if (value == null || value === '') return null
  const numeric = Number(String(value).replace(/\s+/g, '').replace(/,/g, '.').replace(/[^0-9.-]/g, ''))
  if (!Number.isFinite(numeric)) {
    return null
  }

  return numeric
}

const parseDateToUtc = (value) => {
  if (value == null || value === '') return null
  const trimmed = String(value).trim()
  if (!trimmed) return null

  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (isoMatch) {
    const [, year, month, day] = isoMatch
    const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
    return Number.isNaN(date.getTime()) ? null : date
  }

  const shortMatch = trimmed.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})$/)
  if (shortMatch) {
    let [, day, month, year] = shortMatch
    if (year.length === 2) {
      year = Number(year) >= 50 ? `19${year}` : `20${year}`
    }
    const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
    return Number.isNaN(date.getTime()) ? null : date
  }

  return null
}

const toIsoDate = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return ''
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const addDaysUtc = (date, days) => {
  const next = new Date(date.getTime())
  next.setUTCDate(next.getUTCDate() + days)
  return next
}

const estimateInstallment = ({ debt, installments, annualRate, fallback }) => {
  if (!Number.isFinite(debt) || debt <= 0 || !Number.isFinite(installments) || installments <= 0) {
    return fallback
  }

  const effectiveRate = Number.isFinite(annualRate) ? annualRate : 0
  const interestFactor = 1 + (effectiveRate / 100) * 0.25
  return (debt * interestFactor) / installments
}

const buildDemoPlansFromRecord = (record) => {
  if (!record || typeof record !== 'object') {
    return []
  }

  const debt = parseCurrencyNumber(record.MONTOADEUDADO ?? record.SALDOCAPITAL ?? record.MONTOPAGAR)
  const baseInstallments = parseInteger(record.PLAZOACTUAL ?? record.CUOTAS) ?? 24
  const baseRate = parsePercentNumber(record.TASAACTUAL ?? record.TASA_COBROS) ?? 12
  const fallbackInstallment = parseCurrencyNumber(record.MONTOPAGAR ?? record.LETRA_COMPLETA) ?? 150

  const frequency = String(record.FRECUENCIAPAGO || '').trim().toUpperCase()
  const frequencyStepInDays = frequency.includes('SEMANAL')
    ? 7
    : frequency.includes('QUINCENAL')
      ? 15
      : 30

  const baseDate =
    parseDateToUtc(record.FECHA_PAGO) ||
    parseDateToUtc(record.FECHAINICIOPAGO) ||
    addDaysUtc(new Date(), frequencyStepInDays)

  const options = [
    { id: 'plan1', title: 'Plan 1', installmentFactor: 0.85, rateDelta: -1, dateStep: 1 },
    { id: 'plan2', title: 'Plan 2', installmentFactor: 1, rateDelta: 0, dateStep: 2 },
    { id: 'plan3', title: 'Plan 3', installmentFactor: 1.2, rateDelta: 1.5, dateStep: 3 },
  ]

  return options.map((option, index) => {
    const offeredInstallments = Math.max(6, Math.round(baseInstallments * option.installmentFactor))
    const offeredRate = Math.max(0, Number((baseRate + option.rateDelta).toFixed(2)))
    const cuota = estimateInstallment({
      debt,
      installments: offeredInstallments,
      annualRate: offeredRate,
      fallback: fallbackInstallment,
    })
    const paymentDate = addDaysUtc(baseDate, frequencyStepInDays * option.dateStep)
    const rawDate = toIsoDate(paymentDate)

    return {
      id: option.id,
      titulo: option.title,
      cuotaRaw: cuota,
      cuotaKey: `DEMO_CUOTA_FINAL_${index + 1}`,
      extensionRaw: offeredInstallments,
      extensionKeyUsed: `DEMO_PLAZO_OFERTA_${index + 1}`,
      tasaRaw: offeredRate,
      tasaKey: `DEMO_TASA_OFERTA_${index + 1}`,
      fechaRaw: rawDate,
      fechaKey: `DEMO_FECHA_PAGO_${index + 1}`,
      cuotaLabel: formatCurrency(cuota),
      extLabel: formatMonths(offeredInstallments),
      tasaLabel: formatPercent(offeredRate),
      fechaLabel: formatDate(rawDate),
    }
  })
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
    const storedData = localStorage.getItem('suma-financiera:clienteData')
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
            localStorage.setItem('suma-financiera:clienteData', JSON.stringify(data.record))
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

  const productName = useMemo(() => {
    const rawProduct = record?.PRODUCTO
    if (rawProduct == null) return null

    const trimmed = String(rawProduct).trim()
    return trimmed || null
  }, [record])

  const productDisplay = productName ? `tu ${productName}` : 'tu préstamo'

  const generalInfo = useMemo(
    () => ({
      saldo: formatCurrency(record?.MONTOADEUDADO ?? record?.SALDOCAPITAL),
      producto: record?.PRODUCTO || '—',
      numeroCredito: record?.NUMEROPRESTAMO ?? record?.NUMCRED ?? '—',
      plazoActual: formatMonths(record?.PLAZOACTUAL ?? record?.PLAZO_CONTRATADO),
      tasaActual: formatPercent(record?.TASAACTUAL ?? record?.TASA_COBROS),
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
        fechaKey: 'FECHA_PAGO',
      },
      {
        id: 'plan2',
        titulo: 'Plan 2',
        cuotaKey: 'CUOTA_FINAL_2',
        extensionKey: 'PLAZO_OFERTA_2',
        tasaKey: 'TASA_OFERTA_2',
        fechaKey: 'FECHA_PAGO',
      },
      {
        id: 'plan3',
        titulo: 'Plan 3',
        cuotaKey: 'CUOTA_FINAL_3',
        extensionKey: 'PLAZO_OFERTA_3',
        tasaKey: 'TASA_OFERTA_3',
        fechaKey: 'FECHA_PAGO',
      },
    ]

    const resolvedPlans = planDefinitions
      .map((definition) => {
        const cuota = resolveValue(definition.cuotaKey)
        const extension = resolveValue(definition.extensionKey)
        const tasa = resolveValue(definition.tasaKey)
        const fecha = resolveValue(definition.fechaKey)

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

    const demoPlans = buildDemoPlansFromRecord(record)

    if (resolvedPlans.length === planDefinitions.length) {
      return resolvedPlans
    }

    return planDefinitions
      .map((definition) => {
        const backendPlan = resolvedPlans.find((plan) => plan.id === definition.id)
        if (backendPlan) {
          return backendPlan
        }

        return demoPlans.find((plan) => plan.id === definition.id) || null
      })
      .filter(Boolean)
  }, [record])

  useEffect(() => {
    if (plans.length === 0) {
      setSelectedPlan(null)
      return
    }

    const storedSelection = localStorage.getItem('suma-financiera:selectedPlan')

    if (!storedSelection) {
      return
    }

    try {
      const parsed = JSON.parse(storedSelection)
      if (parsed?.id && plans.some((plan) => plan.id === parsed.id)) {
        setSelectedPlan(parsed.id)
      }
    } catch (parseError) {
      console.error('No se pudo leer el plan almacenado', parseError)
    }
  }, [plans])

  const selectedPlanDetails = useMemo(() => {
    if (!selectedPlan) {
      return plans[0] || null
    }

    return plans.find((item) => item.id === selectedPlan) || plans[0] || null
  }, [plans, selectedPlan])

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
        localStorage.setItem('suma-financiera:selectedPlan', JSON.stringify(payload))
      } catch (storageError) {
        console.error('No se pudo guardar el plan seleccionado', storageError)
      }
    }

    navigate(buildPathWithDana('/verificacion', danaParam))
  }

  return (
    <div className="py-6">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">
          <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
            <aside className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4">
              <CompactStepper current={1} />
            </aside>

            <section>
              <header>
                <h1 className="text-xl font-semibold text-gray-900 md:text-2xl">Simulador de reestructuración</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Bienvenido, aquí podrás reestructurar tus pagos y ponerte al día con {productDisplay}.
                </p>
              </header>

              <div className="mt-4 rounded-2xl border border-gray-200 bg-white px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-gray-500">Nombre</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">{record?.NOMBRE || record?.nombre || '—'}</p>
              </div>

              <section className="mt-5">
                <h2 className="text-sm font-semibold text-gray-900">Resumen de crédito</h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                  <MiniDataCard label="Saldo actual" value={generalInfo.saldo} emphasize />
                  <MiniDataCard label="Producto" value={generalInfo.producto} />
                  <MiniDataCard label="N° de crédito" value={generalInfo.numeroCredito} />
                  <MiniDataCard label="Plazo actual" value={generalInfo.plazoActual} />
                  <MiniDataCard label="Tasa actual" value={generalInfo.tasaActual} />
                </div>
              </section>

              <section className="mt-6 grid gap-5 xl:grid-cols-[1.2fr_0.8fr] xl:items-start">
                <div className="rounded-2xl border border-gray-200 bg-gray-50/50 p-4 md:p-5">
                  <h2 className="text-base font-semibold text-gray-900">¿Cuánto quieres pagar al mes?</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    El nuevo plazo incluye las letras que aún tienes por pagar y te ofrece un tiempo adicional. Elige la opción que mejor se adapte a ti.
                  </p>

                  {loading && (
                    <p className="mt-3 text-sm text-gray-500">Cargando opciones de reestructuración…</p>
                  )}

                  {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

                  <div className="mt-4 space-y-3">
                    {plans.map((plan) => (
                      <MonthlyOptionButton
                        key={plan.id}
                        plan={plan}
                        checked={selectedPlan === plan.id}
                        onSelect={() => setSelectedPlan(plan.id)}
                      />
                    ))}
                  </div>

                  {!loading && !error && plans.length === 0 && (
                    <p className="mt-3 text-sm text-gray-600">
                      No hay planes disponibles en este momento. Intenta nuevamente más tarde.
                    </p>
                  )}
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Plan seleccionado</h3>

                  {selectedPlanDetails ? (
                    <>
                      <div className="mt-3 rounded-xl border border-brand-200 bg-brand-50/60 p-4">
                        <p className="text-xs uppercase tracking-wide text-gray-600">{selectedPlanDetails.titulo}</p>
                        <p className="mt-1 text-3xl font-extrabold text-gray-900">{selectedPlanDetails.cuotaLabel}</p>
                        <p className="text-sm text-gray-600">Letra mensual</p>
                      </div>

                      <ul className="mt-4 space-y-3">
                        <DetailRow icon={<IconAlarm />} label="Nuevo plazo" value={selectedPlanDetails.extLabel} />
                        <DetailRow icon={<IconPlant />} label="Tasa de interés anual" value={selectedPlanDetails.tasaLabel} />
                        <DetailRow icon={<IconCalendar />} label="Próxima fecha de pago" value={selectedPlanDetails.fechaLabel} />
                      </ul>

                      <p className="mt-4 text-xs text-gray-500">(Letras por pagar + Extensión)</p>
                    </>
                  ) : (
                    <p className="mt-3 text-sm text-gray-600">Selecciona una opción para ver el detalle del plan.</p>
                  )}
                </div>
              </section>

              <div className="hidden md:flex mt-6 items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate(buildPathWithDana('/', danaParam))}
                  className="rounded-full border border-gray-300 px-6 py-2.5 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={!selectedPlan}
                  onClick={onContinuar}
                  className={[
                    'rounded-full px-7 py-2.5 font-semibold transition-colors',
                    selectedPlan
                      ? 'bg-brand-500 text-white hover:bg-brand-600'
                      : 'cursor-not-allowed bg-brand-200 text-gray-500',
                  ].join(' ')}
                >
                  Continuar
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white/95 p-3 shadow-[0_-8px_24px_-18px_rgba(15,23,42,0.45)] backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-6xl gap-3 px-1">
          <button
            type="button"
            onClick={() => navigate(buildPathWithDana('/', danaParam))}
            className="flex-1 rounded-full border border-gray-300 px-4 py-2.5 font-semibold text-gray-700"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!selectedPlan}
            onClick={onContinuar}
            className={[
              'flex-1 rounded-full px-4 py-2.5 font-semibold',
              selectedPlan ? 'bg-brand-500 text-white' : 'cursor-not-allowed bg-brand-200 text-gray-500',
            ].join(' ')}
          >
            Continuar
          </button>
        </div>
      </div>

      <div className="h-20 md:hidden" aria-hidden="true" />
    </div>
  )
}

function CompactStepper({ current = 1 }) {
  const steps = [
    { id: 1, label: 'Plan de pago' },
    { id: 2, label: 'Verificación' },
    { id: 3, label: 'Términos y condiciones' },
  ]

  return (
    <nav aria-label="Progreso del flujo">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Proceso</p>
      <ol className="mt-3 space-y-3">
        {steps.map((step) => {
          const isActive = step.id === current
          const isDone = step.id < current

          return (
            <li key={step.id} className="flex items-center gap-3">
              <span
                className={[
                  'flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold',
                  isActive
                    ? 'border-brand-500 bg-brand-500 text-white'
                    : isDone
                      ? 'border-brand-400 bg-brand-100 text-brand-700'
                      : 'border-gray-300 bg-white text-gray-500',
                ].join(' ')}
                aria-hidden="true"
              >
                {step.id}
              </span>
              <span className={isActive ? 'text-sm font-semibold text-gray-900' : 'text-sm text-gray-600'}>
                {step.label}
              </span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

function MiniDataCard({ label, value, emphasize = false }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3 py-3 shadow-sm">
      <p className="text-[11px] uppercase tracking-wide text-gray-500">{label}</p>
      <p className={emphasize ? 'mt-1 text-2xl font-extrabold text-gray-900' : 'mt-1 text-base font-semibold text-gray-900'}>
        {value}
      </p>
    </div>
  )
}

function MonthlyOptionButton({ plan, checked, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        'w-full rounded-2xl border px-4 py-4 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
        checked
          ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-200 shadow-sm'
          : 'border-gray-200 bg-white hover:border-brand-300 hover:bg-orange-50/30',
      ].join(' ')}
      aria-pressed={checked}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">{plan.titulo}</p>
          <p className="mt-1 text-3xl font-extrabold leading-none text-gray-900">{plan.cuotaLabel}</p>
          <p className="mt-1 text-sm text-gray-600">Letra mensual</p>
        </div>
        <span
          className={[
            'mt-1 flex h-6 w-6 items-center justify-center rounded-full border',
            checked ? 'border-brand-500 bg-brand-500 text-white' : 'border-gray-300 bg-white text-transparent',
          ].join(' ')}
          aria-hidden="true"
        >
          <CheckIcon />
        </span>
      </div>
    </button>
  )
}

function DetailRow({ icon, label, value }) {
  return (
    <li className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-700">{icon}</span>
      <span className="min-w-0">
        <span className="block text-xs text-gray-500">{label}</span>
        <span className="block font-semibold text-gray-900">{value}</span>
      </span>
    </li>
  )
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 12l4 4 8-8" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

function IconAlarm() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-gray-600">
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
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-gray-600">
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
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-gray-600">
      <rect x="4" y="5" width="16" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 9.5h16" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 3.5v3M15 3.5v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="9" y="12" width="2.8" height="2.8" rx="0.6" fill="currentColor" />
    </svg>
  )
}
