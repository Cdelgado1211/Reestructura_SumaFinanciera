import React from 'react'
import { useLocation } from 'react-router-dom'

const errorMessages = {
  default: {
    title: 'Tu sesión ha expirado',
    description:
      'Por seguridad, tu sesión se cerró automáticamente después de un tiempo sin actividad. Vuelve a iniciar para continuar.',
  },
  committedChoice: {
    title: 'Tu reestructuración ya fue procesada',
    description:
      'Ya registramos tu selección previamente. Si necesitas hacer algún ajuste adicional, comunícate con nosotros para revisar nuevas alternativas.',
  },
  statusExpired: {
    title: 'Esta oferta de Reestructuración ya no está disponible',
    description:
      'Esta oferta ya no está activa, si deseas puedes ponerte en contacto con nuestra Sucursal Telefónica al (507) 306-4700.',
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

  if (messageKey === 'statusExpired') {
    return (
      <div className="py-8">
        <div className="max-w-md mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl shadow-lg p-8 text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center">
              <img
                src="https://imgcdn.email-platform.com/banistmo/icohalt.png"
                alt="Alerta"
                className="w-10 h-10"
              />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
              <p className="text-gray-600">{description}</p>
            </div>
            <a
              href="https://www.banistmo.com/"
              className="inline-flex items-center justify-center rounded-full bg-yellow-400 px-6 py-3 font-semibold text-gray-900 shadow focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2"
            >
              Entendido
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="max-w-md mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl shadow-lg p-8 text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center">
            <img
              src="https://imgcdn.email-platform.com/banistmo/icohalt.png"
              alt="Alerta"
              className="w-10 h-10"
            />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            <p className="text-gray-600">{description}</p>
          </div>
          <a
            href="https://www.banistmo.com/"
            className="inline-flex items-center justify-center rounded-full bg-yellow-400 px-6 py-3 font-semibold text-gray-900 shadow focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2"
          >
            Entendido
          </a>
        </div>
      </div>
    </div>
  )
}
