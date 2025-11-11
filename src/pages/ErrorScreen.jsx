import React from 'react'
import { useLocation } from 'react-router-dom'

const errorMessages = {
  default: {
    title: 'No pudimos cargar tu información',
    description:
      'Por favor regresa al correo con tu oferta y vuelve a hacer clic en el enlace para intentarlo nuevamente. Si el problema persiste, contáctanos para ayudarte.',
  },
  committedChoice: {
    title: 'Tu reestructuración ya fue procesada',
    description:
      'Ya registramos tu selección previamente. Si necesitas hacer algún ajuste adicional, comunícate con nosotros para revisar nuevas alternativas.',
  },
  statusExpired: {
    title: 'Tu reestructuración tiene estatus de Expirada',
    description:
      'Si tienes dudas sobre esto, comunícate con nosotros para revisar nuevas alternativas.',
  },
  statusCancelled: {
    title: 'Tu reestructuración tiene estatus de Cancelada',
    description:
      'Si tienes dudas sobre esto, comunícate con nosotros para revisar nuevas alternativas.',
  },
}

export default function ErrorScreen() {
  const location = useLocation()
  const messageKey = location.state?.messageKey
  const message = errorMessages[messageKey] || errorMessages.default
  const { title, description } = message

  return (
    <div className="py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl shadow p-8 text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-red-500 text-3xl" aria-hidden="true">
              !
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          <p className="text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  )
}
