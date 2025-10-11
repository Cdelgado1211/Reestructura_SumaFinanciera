import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { isServiceErrorResponse } from '../utils/serviceResponse'
import { buildPathWithDana, getDanaParamFromSearch, persistDanaParam } from '../utils/dana'

const LAMBDA_ENDPOINT = 'https://3nift3okknzemzfp7y4u57q6ne0lwfnj.lambda-url.us-east-1.on.aws/'

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
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
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
    () => [
      {
        label: 'Saldo total actual',
        value: formatCurrency(record?.SALDOCAPITAL),
        highlight: true,
      },
      { label: 'Plazo', value: record?.PLAZO_CONTRATADO || '—' },
      { label: 'Monto vencido', value: formatCurrency(record?.TOTALVENC_POST) },
      { label: 'Producto', value: record?.PRODUCTO || '—' },
      { label: 'N° de Crédito', value: record?.NUMCRED || '—' },
      { label: 'Tasa actual', value: formatPercent(record?.TASA_COBROS) },
      { label: 'Letra actual', value: formatCurrency(record?.LETRA_COMPLETA) },
    ],
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
  const onConfirm = async () => {
    if (!hasPlanSelection || submitting || !danaParam) {
      return
    }

    setSubmitError(null)
    setSubmitting(true)

    const sanitizeValue = (detail, fallback) => {
      if (detail && detail.value != null && detail.value !== '') {
        return detail.value
      }

      if (fallback != null && fallback !== '') {
        return fallback
      }

      return ''
    }

    try {
      const payload = {
        NEW_LETRA_MENSUAL: sanitizeValue(
          displayPlan.cuota,
          storedPlan?.fields?.cuota?.raw,
        ),
        NEW_EXTENSION_PLAZO: sanitizeValue(
          displayPlan.extension,
          storedPlan?.fields?.extension?.raw,
        ),
        NEW_TASA_INTERES: sanitizeValue(
          displayPlan.tasa,
          storedPlan?.fields?.tasa?.raw,
        ),
        NEW_FECHA_PAGO_FIN: sanitizeValue(
          displayPlan.fecha,
          storedPlan?.fields?.fecha?.raw,
        ),
      }

      if (storedPlan?.id || storedPlan?.titulo) {
        payload.metadata = {}
        if (storedPlan?.id) {
          payload.metadata.planId = storedPlan.id
        }
        if (storedPlan?.titulo) {
          payload.metadata.planTitulo = storedPlan.titulo
        }
      }

      const response = await fetch(
        `${LAMBDA_ENDPOINT}?dana=${encodeURIComponent(danaParam)}&s=c`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      )

      if (!response.ok) {
        throw new Error(`Error ${response.status}`)
      }

      let data = null
      try {
        data = await response.json()
      } catch (parseError) {
        console.warn('La respuesta del servicio no contenía JSON', parseError)
      }

      if (data && isServiceErrorResponse(data, { requireRecord: false })) {
        navigate('/error', { replace: true })
        return
      }

      navigate(buildPathWithDana('/contrato', danaParam))
    } catch (error) {
      console.error('No se pudo confirmar el plan seleccionado', error)
      setSubmitError('No pudimos confirmar tu selección. Intenta nuevamente en unos minutos.')
    } finally {
      setSubmitting(false)
    }
  }

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

          {/* Información del préstamo */}
          <div className="mt-6">
            <h2 className="text-base font-semibold text-gray-900 mb-3">Información de tu préstamo actual</h2>
            <div className="rounded-2xl border border-gray-200 p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-10">
                {generalInfo.map(({ label, value, highlight }) => (
                  <div key={label}>
                    <div className="text-sm text-gray-600">{label}</div>
                    <div
                      className={[
                        'text-lg font-semibold text-gray-900',
                        highlight ? 'text-2xl font-extrabold' : '',
                      ].join(' ')}
                    >
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Plan seleccionado */}
          <div className="mt-6">
            <h2 className="text-base font-semibold text-gray-900 mb-3">Plan seleccionado</h2>

            {hasPlanSelection ? (
              <div className="rounded-2xl border-2 border-yellow-300 bg-white p-5">
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
                  <div className="text-sm text-gray-600">{storedPlan.titulo}</div>
                  <div>
                    <div className="text-3xl font-extrabold text-gray-900">
                      {formatCurrency(displayPlan.cuota.value)}
                    </div>
                    <div className="text-xs text-gray-500 text-right sm:text-left">Total plan</div>
                  </div>
                </div>

                <ul className="mt-4 space-y-3 text-sm text-gray-800">
                  <li className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                      1
                    </span>
                    <span>
                      Extensión del plazo{' '}
                      <strong>{formatMonths(displayPlan.extension.value)}</strong>
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                      2
                    </span>
                    <span>
                      Tasa de interés anual{' '}
                      <strong>{formatPercent(displayPlan.tasa.value)}</strong>
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                      3
                    </span>
                    <span>
                      Fecha de pago <strong>{formatDate(displayPlan.fecha.value)}</strong>
                    </span>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
                Selecciona un plan en el paso anterior para revisar sus detalles.
              </div>
            )}
          </div>

          {/* Pregunta + acciones */}
          <p className="mt-6 text-gray-700">¿Confirmas la reestructuración de la deuda?</p>

          {submitError && (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {submitError}
            </p>
          )}

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
              disabled={!hasPlanSelection || submitting || !danaParam}
              className={[
                'px-6 py-2.5 rounded-full font-semibold transition-colors',
                hasPlanSelection && !submitting && danaParam
                  ? 'bg-yellow-400 hover:bg-yellow-500 text-gray-900'
                  : 'bg-yellow-200 text-gray-500 cursor-not-allowed',
              ].join(' ')}
            >
              {submitting ? 'Confirmando…' : 'Confirmar'}
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
