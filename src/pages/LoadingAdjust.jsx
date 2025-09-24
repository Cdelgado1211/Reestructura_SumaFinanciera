import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import clock from '../assets/clock.png' // ⬅️ asegúrate de tener src/assets/clock.png

export default function LoadingAdjust() {
  const navigate = useNavigate()

  useEffect(() => {
    const t = setTimeout(() => navigate('/confirmacion'), 2200)
    return () => clearTimeout(t)
  }, [navigate])

  return (
    <div className="py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Tarjeta maestro */}
        <div className="bg-white rounded-2xl shadow p-10 flex flex-col items-center text-center">
          {/* Imagen del reloj */}
          <img
            src={clock}
            alt="Reloj"
            className="w-20 h-20 sm:w-6 sm:h-20 mb-20 object-contain"
          />

          <h1 className="text-2xl font-semibold text-gray-900">Un momento</h1>
          <p className="mt-2 text-gray-600">
            Estamos ajustando el plan de pago
          </p>

          {/* Spinner */}
          <div className="mt-8">
            <span className="sr-only">Cargando…</span>
            <svg
              className="w-10 h-10 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" stroke="#E5E7EB" strokeWidth="4" />
              <path
                d="M22 12a10 10 0 0 1-10 10"
                stroke="#111827"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
