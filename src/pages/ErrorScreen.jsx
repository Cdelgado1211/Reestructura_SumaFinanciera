import React from 'react'
import { useLocation } from 'react-router-dom'
import alertIcon from '../assets/icohalt.png'

const errorMessages = {
  default: {
    title: 'Tu sesión ha expirado',
    description:
      'Por seguridad, tu sesión se cerró automáticamente después de un tiempo sin actividad. Vuelve a iniciar para continuar.',
  },
  committedChoice: {
    title: 'Tu reestructuración ya está en marcha',
    description:
      'Nos alegra informarte que ya registramos tu selección previamente. Si necesitas ajustar algo o resolver una duda, ponte en contacto con Conciliación con los clientes al (507) 233-8510 / 8520.',
  },
  statusExpired: {
    title: 'Esta oferta de Reestructuración ya no está disponible',
    description:
      'Esta oferta ya no está activa, si deseas puedes ponerte en contacto con Conciliación con los clientes al (507) 233-8510 / 8520.',
  },
  statusCancelled: {
    title: 'Tu reestructuración fue cancelada',
    description:
      'Te informamos que tu selección solicitud de Reestructuración de deuda fue cancelada. Si tienes alguna duda, ponte en contacto con Conciliación con los clientes al (507) 233-8510 / 8520.',
  },
}

export default function ErrorScreen() {
  const location = useLocation()
  const messageKey = location.state?.messageKey
  const message = errorMessages[messageKey] || errorMessages.default
  const { title, description } = message

  if (messageKey === 'committedChoice') {
    return (
      <div className="py-10 bg-gradient-to-b from-yellow-50 via-white to-white">
        <div className="max-w-xl mx-auto px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl border border-yellow-100 bg-white shadow-xl">
            <div className="absolute -top-20 -right-16 h-48 w-48 rounded-full bg-yellow-100/40 blur-3xl" aria-hidden="true" />
            <div className="absolute -bottom-24 -left-10 h-56 w-56 rounded-full bg-yellow-200/30 blur-3xl" aria-hidden="true" />
              <div className="relative p-10 text-center space-y-6">
                <div className="mx-auto w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center shadow-inner">
                  <img src={alertIcon} alt="Alerta" className="w-12 h-12" />
                </div>
              <div className="space-y-3">
                <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
                <p className="text-base text-gray-600 leading-relaxed">
                  Nos alegra informarte que ya registramos tu selección previamente.
                </p>
                <p className="text-base text-gray-600 leading-relaxed">
                  Si necesitas ajustar algo o resolver una duda, ponte en contacto con Conciliación con los clientes al (507) 233-8510 / 8520.
                </p>
              </div>
              <a
                href="https://www.banistmo.com/"
                className="inline-flex items-center justify-center rounded-full bg-yellow-400 px-8 py-3 font-semibold text-gray-900 shadow focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2"
              >
                Entendido
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (messageKey === 'statusExpired') {
    return (
      <div className="py-8">
        <div className="max-w-md mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl shadow-lg p-8 text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center">
              <img src={alertIcon} alt="Alerta" className="w-10 h-10" />
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
            <img src={alertIcon} alt="Alerta" className="w-10 h-10" />
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
