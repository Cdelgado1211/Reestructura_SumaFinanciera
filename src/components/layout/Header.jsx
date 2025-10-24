import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function Header() {
  const location = useLocation()
  const navigate = useNavigate()

  // Mostrar el icono de salir solo después de la primera pantalla
  const showExit = location.pathname !== '/' && location.pathname !== '/error'

  const onExit = () => {
    try {
      localStorage.removeItem('banistmo:selectedPlan')
      // localStorage.removeItem('banistmo:loan') // descomenta si también quieres limpiar esto
    } catch {}
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
            src="https://images.email-platform.com/banistmo/logobanistmoblanco.png"
            alt="Banistmo"
            className="h-7 sm:h-6 cursor-pointer"
            onClick={() => navigate('/')}
          />
        </div>

        {/* Icono Salir (solo después de la primera pantalla) */}
        <div className="justify-self-end">
          {showExit && (
            <button
              onClick={onExit}
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
