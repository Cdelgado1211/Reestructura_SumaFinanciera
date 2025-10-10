import React from 'react'

export default function ErrorScreen() {
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
        </div>
      </div>
    </div>
  )
}
