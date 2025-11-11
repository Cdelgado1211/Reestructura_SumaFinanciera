import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import PrivacyNoticeBody from '../components/privacy/PrivacyNoticeBody'
import { buildPathWithDana, getDanaParamFromSearch, persistDanaParam } from '../utils/dana'

export default function PrivacyConsent() {
  const navigate = useNavigate()
  const location = useLocation()
  const scrollRef = useRef(null)
  const [atEnd, setAtEnd] = useState(false)
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

  const handleContinue = useCallback(() => {
    try {
      localStorage.setItem('banistmo:privacyConsent', 'accepted')
    } catch {}
    navigate(buildPathWithDana('/plan', danaParam))
  }, [danaParam, navigate])

  const checkEnd = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const reachedEnd = el.scrollTop + el.clientHeight >= el.scrollHeight - 1
    setAtEnd(reachedEnd)
  }, [])

  // Vuelve a calcular tras montar / hot-reload (por si el texto ya cabe y no requiere scroll)
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    // llamado inicial
    checkEnd()
    // Observador por si cambian tamaños de fuente o el layout
    const ro = new ResizeObserver(() => checkEnd())
    ro.observe(el)
    return () => ro.disconnect()
  }, [checkEnd])

  return (
    <div className="w-full py-0">
      <div className="mx-auto max-w-3xl">
        {/* Alto viewport */}
        <section className="bg-white sm:rounded-2xl shadow min-h-[calc(100vh-50px)] sm:min-h-[calc(100vh-50px)] mt-[-50px] flex flex-col">

          {/* Header fijo dentro de la tarjeta */}
          <header className="px-6 sm:px-10 pt-6 sm:pt-10">
            <p className="privacy-heading uppercase text-black">
              CONSENTIMIENTO DE TRATAMIENTO DE DATOS
            </p>
            <p className="mt-3 privacy-body text-black">
              Al entregar tu información, declaras que has leído, entiendes y aceptas el
              tratamiento de tus datos conforme al Aviso de Privacidad de Banistmo, S.A. y/o
              subsidiarias, quienes de ahora en adelante se identificarán como “Banistmo”.
            </p>
          </header>

          {/* Contenido con scroll propio */}
          <div
            ref={scrollRef}
            onScroll={checkEnd}
            className="mt-6 px-6 sm:px-10 flex-1 overflow-y-auto pr-4"
            aria-label="Texto del aviso de privacidad (desplázate hasta el final para continuar)"
          >
            <PrivacyNoticeBody />
          </div>

          {/* Footer con CTA */}
          <div
            className="px-6 sm:px-10 pb-6 sm:pb-8 pt-4 border-t border-gray-100"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.5rem)' }}
          >
            {!atEnd && (
              <p className="mb-3 text-xs sm:text-sm text-gray-500">
                Desplázate hasta el final del texto para habilitar el botón.
              </p>
            )}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleContinue}
                disabled={!atEnd}
                className={`rounded-full px-8 py-3 text-sm font-semibold transition-colors
                  ${atEnd
                    ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-500'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                aria-disabled={!atEnd}
              >
                Entendido
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
