import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import ProcessStepper from '../components/layout/ProcessStepper'
import { buildPathWithDana, getDanaParamFromSearch, persistDanaParam } from '../utils/dana'
import { isServiceErrorResponse } from '../utils/serviceResponse'

const LAMBDA_ENDPOINT = 'https://lp5h7egegt2wlrfpur4egp6jge0hwvmy.lambda-url.us-east-1.on.aws/'

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

const MONTH_NAME_TO_NUMBER = {
  enero: '01',
  febrero: '02',
  marzo: '03',
  abril: '04',
  mayo: '05',
  junio: '06',
  julio: '07',
  agosto: '08',
  septiembre: '09',
  setiembre: '09',
  octubre: '10',
  noviembre: '11',
  diciembre: '12',
}

const formatDateForSubmission = (value) => {
  if (value == null) return ''

  const trimmed = String(value).trim()
  if (!trimmed) return ''

  const pad = (segment) => segment.toString().padStart(2, '0')

  const fromParts = (day, month, year) => {
    if (!day || !month || !year) return ''
    return `${pad(day)}-${pad(month)}-${year.toString().padStart(4, '0')}`
  }

  const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (isoMatch) {
    const [, year, month, day] = isoMatch
    return fromParts(day, month, year)
  }

  const shortMatch = trimmed.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})$/)
  if (shortMatch) {
    let [, day, month, year] = shortMatch
    if (year.length === 2) {
      year = `20${year}`
    }
    return fromParts(day, month, year)
  }

  const textMatch = trimmed
    .toLowerCase()
    .match(/^(\d{1,2})\s+de\s+([a-záéíóú]+)\s+de\s+(\d{4})$/)
  if (textMatch) {
    const [, day, monthName, year] = textMatch
    const normalizedMonth = monthName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
    const month = MONTH_NAME_TO_NUMBER[normalizedMonth] || MONTH_NAME_TO_NUMBER[monthName]
    if (month) {
      return fromParts(day, month, year)
    }
  }

  const parsed = new Date(trimmed)
  if (!Number.isNaN(parsed.getTime())) {
    return fromParts(parsed.getUTCDate(), parsed.getUTCMonth() + 1, parsed.getUTCFullYear())
  }

  return trimmed
}

export default function Contract() {
  const navigate = useNavigate()
  const location = useLocation()
  const [danaParam, setDanaParam] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const storedPlan = useMemo(
    () => parseJSON(localStorage.getItem('suma-financiera:selectedPlan')) || EMPTY_PLAN,
    [],
  )
  const record = useMemo(
    () => parseJSON(localStorage.getItem('suma-financiera:clienteData')),
    [],
  )

  const displayPlan = useMemo(() => {
    const extension = resolveFieldDetails(storedPlan.fields?.extension, record)
    const tasa = resolveFieldDetails(storedPlan.fields?.tasa, record)
    const cuota = resolveFieldDetails(storedPlan.fields?.cuota, record)
    const fecha = resolveFieldDetails(storedPlan.fields?.fecha, record)

    return { extension, tasa, cuota, fecha }
  }, [record, storedPlan])

  const hasPlanSelection = Boolean(storedPlan?.id)

  const selectedPlanChoice = useMemo(() => {
    if (!storedPlan?.id) return null

    const normalizedId = String(storedPlan.id).toLowerCase()
    const planMatch = normalizedId.match(/plan(\d+)/)
    if (planMatch?.[1]) {
      return planMatch[1]
    }

    const genericMatch = normalizedId.match(/(\d+)/)
    return genericMatch?.[1] || null
  }, [storedPlan])

  useEffect(() => {
    const danaValue = getDanaParamFromSearch(location.search)
    if (!danaValue) {
      setDanaParam('')
      navigate('/error', { replace: true })
      return
    }

    setDanaParam(danaValue)
    persistDanaParam(danaValue)

    if (!hasPlanSelection) {
      navigate(buildPathWithDana('/plan', danaValue), { replace: true })
    }
  }, [hasPlanSelection, location.search, navigate])

  const onCancel = () => navigate(buildPathWithDana('/verificacion', danaParam))
  const onConfirm = async (e) => {
    e.preventDefault()
    if (!accepted || submitting) return
    if (!danaParam) return

    if (!hasPlanSelection) {
      navigate(buildPathWithDana('/plan', danaParam), { replace: true })
      return
    }

    setSubmitError(null)
    setSubmitting(true)

    try {
      const selectedValue = (detail, fallbackRaw) => {
        if (detail && detail.value != null && detail.value !== '') {
          return detail.value
        }

        if (fallbackRaw != null && fallbackRaw !== '') {
          return fallbackRaw
        }

        return ''
      }

      const payload = {
        MONTOPAGAR: selectedValue(
          displayPlan.cuota,
          storedPlan?.fields?.cuota?.raw,
        ),
        FRECUENCIAPAGO: selectedValue(
          displayPlan.extension,
          storedPlan?.fields?.extension?.raw,
        ),
        NEW_TASA_INTERES: selectedValue(
          displayPlan.tasa,
          storedPlan?.fields?.tasa?.raw,
        ),
        FECHAINICIOPAGO: formatDateForSubmission(
          selectedValue(displayPlan.fecha, storedPlan?.fields?.fecha?.raw),
        ),
        USER_COMMITTED_CHOICE: true,
        USER_PLAN_CHOICE: selectedPlanChoice,
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

      navigate(buildPathWithDana('/ajustando', danaParam))
    } catch (error) {
      console.error('No se pudo confirmar el plan seleccionado', error)
      setSubmitError('No pudimos confirmar tu selección. Intenta nuevamente en unos minutos.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="py-6">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">
          <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
            <aside className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4">
              <ProcessStepper current={3} />
            </aside>

            <section className="flex min-h-[70vh] flex-col">
              <div>
                <h1 className="text-xl font-semibold text-gray-900 md:text-2xl">Reestructuración de deuda</h1>
                <p className="text-gray-600">Lee y acepta los términos y condiciones</p>
              </div>

              <div className="mt-6">
            <div className="rounded-2xl border border-gray-200">
              <div
                className="rounded-xl bg-white max-h-[60vh] sm:max-h-[58vh] overflow-y-auto p-6 pr-4"
                aria-label="Términos y condiciones (desplázate para leer)"
              >
                <h3 className="text-center font-semibold text-gray-900">TÉRMINOS Y CONDICIONES</h3>

                <div className="prose-sm text-sm text-gray-800 mt-4 space-y-4">
                  <p>
                    Al utilizar esta plataforma, usted confirma que la información ingresada es correcta,
                    completa y corresponde al titular del crédito. Cualquier inconsistencia podría impedir
                    el procesamiento de su solicitud.
                  </p>
                  <p>
                    La solicitud de reestructuración será evaluada con base en las políticas internas y en
                    la información disponible al momento de la gestión. El envío de la solicitud no
                    constituye aprobación automática.
                  </p>
                  <p>
                    Al confirmar su selección, usted autoriza el tratamiento de los datos necesarios para
                    ejecutar, registrar y dar seguimiento al proceso de reestructuración de deuda por medios
                    digitales.
                  </p>
                  <p>
                    Las condiciones vigentes de su crédito se mantendrán aplicables hasta que la
                    reestructuración sea formalmente confirmada y reflejada en el sistema. Si no está de
                    acuerdo con estos términos y condiciones, no continúe con el proceso.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer fijo dentro de la tarjeta: checkbox + acciones */}
              <div className="pt-4 mt-auto border-t border-gray-100 bg-white">
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
              />
              <span className="text-gray-800 font-semibold">Aceptar Términos y condiciones</span>
            </label>

            {submitError && (
              <p className="mt-3 text-sm text-red-600" role="alert">
                {submitError}
              </p>
            )}

            <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={onConfirm}
                disabled={!accepted || submitting || !danaParam || !hasPlanSelection}
                className={[
                  'px-6 py-2.5 rounded-full font-semibold transition-colors sm:order-2',
                  accepted && !submitting && danaParam && hasPlanSelection
                    ? 'bg-brand-500 hover:bg-brand-500 text-gray-900'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed',
                ].join(' ')}
              >
                {submitting ? 'Confirmando…' : 'Confirmar'}
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
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
