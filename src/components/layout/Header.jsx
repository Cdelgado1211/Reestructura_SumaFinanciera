import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'

export default function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const [showExitConfirm, setShowExitConfirm] = useState(false)

  // Mostrar el icono de salir solo después de la primera pantalla
  const showExit =
    location.pathname !== '/' &&
    location.pathname !== '/error' &&
    location.pathname !== '/aviso-privacidad'

  const onExit = () => {
    try {
      localStorage.removeItem('banistmo:selectedPlan')
      // localStorage.removeItem('banistmo:loan') // descomenta si también quieres limpiar esto
    } catch {}
    setShowExitConfirm(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 inset-x-0 z-40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 grid grid-cols-3 items-center">
        {/* Slot izquierdo (vacío para mantener el logo perfectamente centrado) */}
        <div />

        {/* Logo centrado */}
        <div className="justify-self-center">
          <img
            src="https://images.email-platform.com/banistmo/Oct_2025/logobanistmo.png"
            alt="Banistmo"
            className="w-[200px] h-auto cursor-pointer"
            onClick={() => navigate('/')}
          />
        </div>

        {/* Icono Salir (solo después de la primera pantalla) */}
        <div className="justify-self-end">
          {showExit && (
            <button
              onClick={() => setShowExitConfirm(true)}
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              aria-label="Salir"
              title="Salir"
            >
              <ExitIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          )}
        </div>
      </div>

      {showExitConfirm && (
        <ExitConfirmationModal onConfirm={onExit} onCancel={() => setShowExitConfirm(false)} />
      )}
    </header>
  )
}

/* Icono de salir */
function ExitIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M15 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h9" stroke="currentColor" />
      <path d="M10 12h10M17 9l3 3-3 3" stroke="currentColor" />
    </svg>
  )
}

function ExitConfirmationModal({ onConfirm, onCancel }) {
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" aria-hidden="true" onClick={onCancel} />
      <div
        className="relative z-10 w-full max-w-sm rounded-3xl bg-white px-8 py-10 text-center shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="exit-confirmation-title"
      >
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#E5F2FF]">
          <LightbulbIcon className="h-10 w-10 text-[#006FCF]" />
        </div>
        <h2 id="exit-confirmation-title" className="mt-6 text-xl font-semibold text-gray-900">
          Salida del portal
        </h2>
        <p className="mt-3 text-sm text-gray-600">
          ¿Estás seguro que deseas salir de la página de Reestructuración de deuda?
        </p>
        <div className="mt-8 space-y-3">
          <button
            type="button"
            onClick={onConfirm}
            className="w-full rounded-full bg-yellow-400 px-6 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-yellow-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400"
          >
            Sí, salir
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full rounded-full border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-300"
          >
            No, regresar
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

function LightbulbIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <path
        d="M24 6a12 12 0 0 0-7.6 21.3c.6.4 1 1.1 1 1.8v1.4a2 2 0 0 0 2 2h9.2a2 2 0 0 0 2-2v-1.4c0-.7.4-1.4 1-1.8A12 12 0 0 0 24 6Z"
        fill="currentColor"
        opacity="0.12"
      />
      <path d="M19 40h10M20 44h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M29.6 27.3c-.6.4-1 .9-1 1.6v1.6a2 2 0 0 1-2 2h-5.2a2 2 0 0 1-2-2v-1.6c0-.7-.4-1.2-1-1.6A11 11 0 1 1 29.6 27.3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M24 10v4M18 12l2 3M30 12l-2 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
