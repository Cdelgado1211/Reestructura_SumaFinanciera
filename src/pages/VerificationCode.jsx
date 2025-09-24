import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const METHOD_COPY = {
  sms: {
    channel: 'SMS',
    detail: 'al +507 3**7654',
    resendSuccess: 'Hemos enviado un nuevo código por SMS. Revisa tu bandeja de mensajes.',
  },
  email: {
    channel: 'correo electrónico',
    detail: 'a dani**@b****.com',
    resendSuccess: 'Hemos enviado un nuevo código a tu correo electrónico.',
  },
}

const MODAL_COPY = {
  retry: {
    title: 'Inténtalo de nuevo',
    description: 'El sistema no pudo validar tu acción. Por favor vuelve a intentarlo.',
  },
  locked: {
    title: 'Intentos agotados',
    description:
      'Lamentablemente no hemos podido verificar el código de seguridad, ya que se han agotado todos los intentos disponibles. Dentro de 24 horas podrás ingresar nuevamente.',
  },
}

const CODE_LENGTH = 6
const MAX_ATTEMPTS = 3
const RESEND_DELAY_MS = 30_000
const CORRECT_CODE = '123456'

export default function VerificationCode() {
  const navigate = useNavigate()
  const [digits, setDigits] = useState(Array(CODE_LENGTH).fill(''))
  const [attempts, setAttempts] = useState(0)
  const [modalType, setModalType] = useState(null)
  const [resendReady, setResendReady] = useState(false)
  const [resendMessage, setResendMessage] = useState('')
  const [isLocked, setIsLocked] = useState(false)
  const inputRefs = useRef([])
  const resendTimeoutRef = useRef(null)

  const method = useMemo(() => {
    try {
      return localStorage.getItem('banistmo:verificationMethod') || 'sms'
    } catch {
      return 'sms'
    }
  }, [])

  const methodCopy = METHOD_COPY[method] || METHOD_COPY.sms
  const isComplete = digits.every((digit) => digit.length === 1)

  const focusFirstInput = () => {
    const focus = () => {
      inputRefs.current[0]?.focus()
    }

    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(focus)
    } else {
      setTimeout(focus, 0)
    }
  }

  const resetDigits = () => {
    setDigits(Array(CODE_LENGTH).fill(''))
    focusFirstInput()
  }

  useEffect(() => {
    focusFirstInput()
  }, [])

  useEffect(() => {
    resendTimeoutRef.current = setTimeout(() => {
      setResendReady(true)
    }, RESEND_DELAY_MS)

    return () => {
      if (resendTimeoutRef.current) {
        clearTimeout(resendTimeoutRef.current)
      }
    }
  }, [])

  const handleChange = (index, value) => {
    if (isLocked) return

    const sanitized = value.replace(/\D/g, '').slice(-1)
    setDigits((prev) => {
      const next = [...prev]
      next[index] = sanitized
      return next
    })

    if (sanitized && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (event, index) => {
    if (isLocked) {
      event.preventDefault()
      return
    }

    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
      setDigits((prev) => {
        const next = [...prev]
        next[index - 1] = ''
        return next
      })
      event.preventDefault()
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
      event.preventDefault()
    }

    if (event.key === 'ArrowRight' && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
      event.preventDefault()
    }
  }

  const handlePaste = (event) => {
    if (isLocked) {
      event.preventDefault()
      return
    }

    event.preventDefault()
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH)
    if (!pasted) return

    const nextDigits = Array(CODE_LENGTH)
      .fill('')
      .map((_, index) => pasted[index] || '')

    setDigits(nextDigits)

    const focusIndex = Math.min(pasted.length, CODE_LENGTH) - 1
    if (focusIndex >= 0) {
      inputRefs.current[focusIndex]?.focus()
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!isComplete || isLocked) return

    const code = digits.join('')
    if (code === CORRECT_CODE) {
      navigate('/aviso-privacidad')
      return
    }

    const nextAttempts = attempts + 1
    setAttempts(nextAttempts)
    resetDigits()

    if (nextAttempts >= MAX_ATTEMPTS) {
      setIsLocked(true)
      setModalType('locked')
    } else {
      setModalType('retry')
    }
  }

  const handleResend = () => {
    if (!resendReady) return

    setResendReady(false)
    setResendMessage(methodCopy.resendSuccess)
    resetDigits()

    if (resendTimeoutRef.current) {
      clearTimeout(resendTimeoutRef.current)
    }

    resendTimeoutRef.current = setTimeout(() => {
      setResendReady(true)
      setResendMessage('')
    }, RESEND_DELAY_MS)
  }

  const closeModal = () => {
    if (modalType === 'locked') {
      navigate('/')
      return
    }

    setModalType(null)
    focusFirstInput()
  }

  const modalCopy = modalType ? MODAL_COPY[modalType] : null

  return (
    <div className="relative w-full py-8 sm:py-12">
      <div className="mx-auto max-w-3xl px-4">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-lg px-6 py-8 sm:px-12 sm:py-12 flex flex-col items-center text-center"
        >
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 max-w-xl">
            Te enviamos un código de verificación por {methodCopy.channel}. Ingrésalo para continuar.
          </h1>
          <p className="mt-2 text-sm text-gray-600">{`Enviado ${methodCopy.detail}.`}</p>

          <div className="mt-8 flex justify-center gap-2.5 sm:gap-4" onPaste={handlePaste}>
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputRefs.current[index] = element
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(event) => handleChange(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(event, index)}
                disabled={isLocked}
                className="h-14 w-12 sm:h-16 sm:w-14 rounded-2xl border border-gray-200 bg-white text-center text-lg font-semibold text-gray-900 shadow-sm focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-200 disabled:bg-gray-100"
                aria-label={`Dígito ${index + 1} del código de verificación`}
              />
            ))}
          </div>

          <div className="mt-8 flex flex-col items-center gap-3 text-sm text-gray-600">
            {resendReady ? (
              <button
                type="button"
                onClick={handleResend}
                className="inline-flex items-center gap-3 rounded-full border border-yellow-400 bg-white px-5 py-2 font-semibold text-gray-900 transition-colors hover:bg-yellow-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400"
              >
                <CheckIcon className="h-5 w-5 text-yellow-500" />
                Solicitar un nuevo código.
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <ProgressIcon className="h-5 w-5 text-yellow-500" />
                <span>Si no recibiste el código, en un momento podrás solicitar uno nuevo.</span>
              </div>
            )}

            {resendMessage && <p className="text-xs text-gray-500">{resendMessage}</p>}
          </div>

          <button
            type="submit"
            disabled={!isComplete || isLocked}
            className={[
              'mt-10 w-full rounded-full px-6 py-3 text-sm font-semibold transition-colors sm:w-auto',
              !isComplete || isLocked
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-yellow-400 text-gray-900 hover:bg-yellow-500',
            ].join(' ')}
          >
            Continuar
          </button>
        </form>
      </div>

      {modalCopy && (
        <div className="fixed inset-0 z-40 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" aria-hidden="true" />
          <div className="relative z-10 w-full max-w-sm rounded-3xl bg-white px-8 py-10 text-center shadow-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 text-yellow-500">
              <HandIcon className="h-8 w-8" />
            </div>
            <h2 className="mt-6 text-xl font-semibold text-gray-900">{modalCopy.title}</h2>
            <p className="mt-3 text-sm text-gray-600">{modalCopy.description}</p>
            <button
              type="button"
              onClick={closeModal}
              className="mt-8 inline-flex w-full justify-center rounded-full bg-yellow-400 px-6 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-yellow-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ProgressIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" opacity="0.3" />
      <path
        d="M12 3a9 9 0 0 1 9 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function CheckIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.2" />
      <path
        d="M16.2 9.5 11 15l-3.2-3.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function HandIcon({ className }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path
        d="M13.667 3.333a2 2 0 0 1 2-2h.666a2 2 0 0 1 2 2v10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 7a2 2 0 0 1 2-2v0a2 2 0 0 1 2 2v7.333"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 9.333A2 2 0 0 1 10 7v0a2 2 0 0 1 2 2v6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 12a2 2 0 0 1 2-2v0a2 2 0 0 1 2 2v5.333"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 11.333V5.333a2 2 0 0 1 2-2v0a2 2 0 0 1 2 2v9.333"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 13.333v7.334c0 5.333 4 8 10 8s10-2.667 10-8V12a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}