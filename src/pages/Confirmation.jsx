import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { buildPathWithDana, getDanaParamFromSearch, persistDanaParam } from '../utils/dana'

const formatCurrency = (value) => {
  if (value == null || value === '') return '—'

  const numeric = Number(String(value).replace(/\s+/g, '').replace(/,/g, '.').replace(/[^0-9.-]/g, ''))
  if (Number.isFinite(numeric)) {
    return `$${numeric.toLocaleString('es-PA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const directNumber = Number(value)
  if (Number.isFinite(directNumber)) {
    return `$${directNumber.toLocaleString('es-PA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return String(value)
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
    return { value: undefined }
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

export default function Confirmation() {
  const navigate = useNavigate()
  const location = useLocation()
  const [danaParam, setDanaParam] = useState('')
  const storedPlan = useMemo(
    () => parseJSON(localStorage.getItem('banistmo:selectedPlan')) || EMPTY_PLAN,
    [],
  )
  const record = useMemo(() => parseJSON(localStorage.getItem('banistmo:clienteData')), [])

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

  const displayPlan = useMemo(() => {
    const extension = resolveFieldDetails(storedPlan?.fields?.extension, record)
    const tasa = resolveFieldDetails(storedPlan?.fields?.tasa, record)
    const cuota = resolveFieldDetails(storedPlan?.fields?.cuota, record)
    const fecha = resolveFieldDetails(storedPlan?.fields?.fecha, record)

    return { extension, tasa, cuota, fecha }
  }, [record, storedPlan])

  const resolveValue = (detail, fallbackField) => {
    if (detail?.value != null && detail.value !== '') {
      return detail.value
    }

    if (fallbackField?.raw != null && fallbackField.raw !== '') {
      return fallbackField.raw
    }

    if (fallbackField?.label && fallbackField.label !== '—') {
      return fallbackField.label
    }

    return undefined
  }

  const loan = useMemo(() => {
    const nombre = record?.nombre || '—'
    const planTitle = storedPlan?.titulo || '—'
    const extension = resolveValue(displayPlan.extension, storedPlan?.fields?.extension)
    const tasa = resolveValue(displayPlan.tasa, storedPlan?.fields?.tasa)
    const cuota = resolveValue(displayPlan.cuota, storedPlan?.fields?.cuota)
    const fecha = resolveValue(displayPlan.fecha, storedPlan?.fields?.fecha)

    return {
      nombre,
      planTitle,
      extension: formatMonths(extension),
      tasa: formatPercent(tasa),
      cuota: formatCurrency(cuota),
      fecha: formatDate(fecha),
    }
  }, [displayPlan, record, storedPlan])

  return (
    <div className="py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h1 className="text-2xl font-semibold text-gray-900">Reestructuración de deuda</h1>
        <p className="text-gray-600 mb-6">Confirmación</p>

        {/* Card central */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow p-6 sm:p-8 text-center">
            {/* Información de tu préstamo */}
            <section className="text-left">
              <div className="rounded-xl border border-gray-200 p-4">
                <div className="text-center">
                  <CheckCelebration />
                  <h2 className="mt-2 text-xl font-semibold text-gray-900">Felicidades</h2>
                  <p className="mt-1 text-gray-700">
                    ¡Hemos recibido tu solicitud de Reestructuración de deuda con éxito!
                  </p>
                </div>

                <h3 className="mt-6 font-semibold text-gray-900">Información de tu préstamo</h3>
                <div className="mt-3">
                  <Item label="Nombre del Cliente" value={loan.nombre} />
                  <Item
                    label="Nuevo plazo"
                    value={loan.extension}
                    helper="(Letras por pagar + Extensión)"
                  />
                  <Item label="Nueva letra mensual" value={loan.cuota} />
                  <Item label="Tasa de interés" value={loan.tasa} />
                </div>
              </div>
            </section>

            {/* Datos del período */}
            <section className="mt-4 text-left">
              <div className="rounded-xl border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900">Datos del período</h3>
                <div className="mt-3">
                  <Item label="Próxima letra a pagar" value={loan.cuota} />
                  <Item label="Próxima fecha de pago" value={loan.fecha} />
                </div>
              </div>
            </section>

            <p className="mt-6 text-gray-700">
              Tu crédito se actualizará en{' '}
              <span className="font-semibold">3 días hábiles</span>.
              <br />
              <span className="font-semibold">
                Las condiciones actuales de su contrato siguen vigentes.
              </span>
            </p>

            <div className="mt-6">
              <a
                href="https://www.banistmo.com/"
                className="inline-block px-8 py-3 rounded-full font-semibold bg-yellow-400 hover:bg-yellow-500 text-gray-900 transition-colors"
              >
                Terminar
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------ UI helpers ------------ */
function Item({ label, value, helper }) {
  return (
    <div className="py-1">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="font-semibold text-gray-900">{value}</div>
      {helper ? (
        <div className="text-[11px] leading-[15px] text-gray-500 mt-1">{helper}</div>
      ) : null}
    </div>
  )
}

function CheckCelebration() {
  return (
    <img
      src="https://imgcdn.email-platform.com/banistmo/checkcompleted.png"
      alt="Confirmación exitosa"
      className="mx-auto"
    />
  )
}
