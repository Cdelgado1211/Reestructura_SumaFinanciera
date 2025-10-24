import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
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
            <p className="privacy-heading uppercase text-[#002f6c]">
              Consentimiento de tratamiento de datos
            </p>
            <h1 className="mt-3 text-xl sm:text-xl font-semibold text-gray-900">
              Al entregar tu información, declaras que has leído, entiendes y aceptas el
              tratamiento de tus datos conforme al Aviso de Privacidad de Banistmo.
            </h1>
          </header>

          {/* Contenido con scroll propio */}
          <div
            ref={scrollRef}
            onScroll={checkEnd}
            className="mt-6 px-6 sm:px-10 flex-1 overflow-y-auto pr-4"
            aria-label="Texto del aviso de privacidad (desplázate hasta el final para continuar)"
          >
            <article className="space-y-6 text-gray-700">
              <div>
                <h2 className="privacy-heading uppercase text-[#002f6c]">Aviso de privacidad</h2>
                <p className="mt-3 privacy-body">
                  En Banistmo, S.A. reconocemos la importancia de la seguridad, la privacidad y la
                  confidencialidad de los datos de nuestros clientes, colaboradores y proveedores. Por
                  eso adoptamos medidas para resguardar los datos personales de las personas y no los
                  compartimos con terceros, a menos que sea requerido por Ley. Todos los datos
                  personales que se recopilan son sometidos a tratamiento y protección conforme a lo
                  establecido en la Ley 81 sobre Protección de Datos Personales, de forma que se
                  recolecten, almacenen, usen, circulen, transformen, actualicen, transmitan o supriman,
                  con base en los principios que se enuncian en la citada Ley. Los datos personales de
                  los clientes de Banistmo, S.A. o que reposen en nuestras bases de datos, en procesos
                  como almacenamiento, procesamiento, cifrado, elaboración, bloqueo, eliminación,
                  circulación u organización, son tratados de acuerdo con los lineamientos establecidos
                  por Banistmo, S.A. y de forma confidencial, bajo estándares estrictos de seguridad
                  tecnológica, física y administrativa.
                </p>
              </div>

              <div>
                <p className="privacy-body">
                  Igualmente te informamos y recordamos que a todos los titulares de los datos personales
                  se les reconocen los siguientes derechos:
                </p>
                <ol className="mt-3 list-[lower-alpha] space-y-2 pl-6">
                  <li className="privacy-body">Derecho a obtener información sobre la existencia y las condiciones de su tratamiento.</li>
                  <li className="privacy-body">Derecho a rectificar o anular sus datos personales.</li>
                  <li className="privacy-body">Derecho a solicitar prueba de la autorización otorgada.</li>
                  <li className="privacy-body">Derecho a revocar su consentimiento.</li>
                  <li className="privacy-body">Derecho a oponerse al tratamiento de sus datos personales.</li>
                  <li className="privacy-body">Derecho a presentar reclamaciones ante la ANTAI.</li>
                  <li className="privacy-body">Derecho a ser informado sobre incidentes de seguridad.</li>
                  <li className="privacy-body">Derecho a ser indemnizado en caso de vulneración de sus derechos.</li>
                  <li className="privacy-body">Derecho a cualquier otro establecido en la Ley 81 y demás leyes aplicables.</li>
                </ol>
              </div>

              <p className="privacy-body">
                En cumplimiento de las disposiciones legales vigentes sobre Protección de Datos Personales en Panamá,
                por medio del presente Aviso de Privacidad te informamos que los datos personales que confíes a
                Banistmo, S.A., en cualquiera de sus interacciones, serán tratados conforme a la legislación aplicable.
                Por lo cual, te solicitamos leer detenidamente la información anterior.
              </p>

              <div className="h-6" />
            </article>
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
