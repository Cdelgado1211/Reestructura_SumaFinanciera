import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function ErrorScreen() {
  const navigate = useNavigate()

  return (
    <div className="py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl shadow p-8 text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-red-500 text-3xl" aria-hidden="true">
              !
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">No pudimos cargar tu información</h1>
          <p className="text-gray-600">
            Por favor regresa al correo con tu oferta y vuelve a hacer clic en el enlace para
            intentarlo nuevamente. Si el problema persiste, contáctanos para ayudarte.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-2.5 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
