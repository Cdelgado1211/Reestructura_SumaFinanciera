import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { buildPathWithDana, getDanaParamFromSearch, persistDanaParam } from '../utils/dana'

export default function Confirmation() {
  const navigate = useNavigate()
  const location = useLocation()
  const [danaParam, setDanaParam] = useState('')

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

  // Recupera lo elegido (o usa defaults si no hay storage)
  const defaultLoan = {
    nombre: 'Daniel Fernando Rojas López',
    plazoMeses: 24,
    nuevaLetra: 184.8,
    tasa: '10%',
  }
  const defaultPlan = { cuota: 184.8, fecha: '30 mar 2024', ext: 24, tasa: '10%' }

  const loan = useMemo(() => {
    try {
      const l = JSON.parse(localStorage.getItem('banistmo:loan')) || {}
      const p = JSON.parse(localStorage.getItem('banistmo:selectedPlan')) || defaultPlan
      return {
        nombre: l?.nombre || defaultLoan.nombre,
        plazoMeses: p?.ext ?? defaultLoan.plazoMeses,
        nuevaLetra: p?.cuota ?? defaultLoan.nuevaLetra,
        tasa: p?.tasa || defaultLoan.tasa,
        proxFecha: p?.fecha || defaultPlan.fecha,
      }
    } catch {
      return { ...defaultLoan, proxFecha: defaultPlan.fecha }
    }
  }, [])

  const money = (n) =>
    new Intl.NumberFormat('es-PA', { style: 'currency', currency: 'USD' }).format(Number(n || 0))

  return (
    <div className="py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h1 className="text-2xl font-semibold text-gray-900">Reestructuración de deuda</h1>
        <p className="text-gray-600 mb-6">Confirmación</p>

        {/* Card central */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow p-6 sm:p-8 text-center">
            <CheckCelebration />

            <h2 className="mt-2 text-xl font-semibold text-gray-900">Felicidades</h2>
            <p className="mt-1 text-gray-700">
              ¡Reestructura de deuda realizada con éxito!
            </p>

            {/* Información de tu préstamo */}
            <section className="mt-6 text-left">
              <h3 className="font-semibold text-gray-900">Información de tu préstamo</h3>

              <div className="mt-3 rounded-xl border border-gray-200 p-4">
                <Item label="Nombre del Cliente" value={loan.nombre} strong />
                <Item label="Nuevo plazo" value={`${loan.plazoMeses} meses`} />
                <Item label="Nueva letra mensual" value={money(loan.nuevaLetra)} />
                <Item label="Tasa de interés" value={loan.tasa} />
              </div>
            </section>

            {/* Datos del período */}
            <section className="mt-4 text-left">
              <h3 className="font-semibold text-gray-900">Datos del período</h3>

              <div className="mt-3 rounded-xl border border-gray-200 p-4">
                <Item label="Próxima letra a pagar" value={money(loan.nuevaLetra)} />
                <Item label="Próxima fecha de pago" value={loan.proxFecha} />
              </div>
            </section>

            <p className="mt-6 text-gray-700">
              Los documentos que sustentan la Reestructuración de tu deuda y tu nuevo plan de pagos,
              fueron enviados al correo electrónico del cliente
            </p>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => navigate(buildPathWithDana('/', danaParam))}
                className="px-8 py-3 rounded-full font-semibold bg-yellow-400 hover:bg-yellow-500 text-gray-900 transition-colors"
              >
                Terminar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------ UI helpers ------------ */
function Item({ label, value, strong }) {
  return (
    <div className="py-1">
      <div className="text-sm text-gray-600">{label}</div>
      <div className={strong ? 'font-semibold text-gray-900' : 'text-gray-900'}>{value}</div>
    </div>
  )
}

function CheckCelebration() {
  // pequeño “check” estilizado
  return (
    <svg width="38" height="38" viewBox="0 0 24 24" className="mx-auto text-green-500" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}
