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
            <article className="space-y-6 text-gray-700">
              <div>
                <h2 className="privacy-heading uppercase text-black">Aviso de privacidad</h2>
                <p className="mt-3 privacy-body">
                  En Banistmo reconocemos la importancia de la seguridad, la privacidad y la
                  confidencialidad de los datos de nuestros clientes, usuarios, colaboradores,
                  proveedores, accionistas, aliados y en general de todo titular de datos personales con
                  los que nos relacionamos; y es por ello que en cumplimiento de lo establecido en la Ley
                  81 sobre Protección de Datos Personales, le informamos que conservaremos sus datos
                  personales a los cuales hemos tenido acceso y le daremos los siguientes tratamientos:
                  solicitar, consultar, recopilar, intercambiar, transferir, transmitir, ceder, grabar,
                  registrar, asociar, disociar, comunicar, interconectar, organizar, elaborar, almacenar,
                  analizar, cancelar, combinar, elaborar, bloquear, eliminar, seleccionar, extraer,
                  confrontar, y en general tratar sus datos personales directamente o con las siguientes
                  entidades nacionales o extranjeras: agencias de información de datos públicos o
                  privados, bancos, agentes económicos, intermediarios financieros, aliados, proveedores
                  de servicios, entidades administrativas o judiciales siempre que esté legitimado por la
                  Ley.
                </p>
              </div>

              <p className="privacy-body">
                Igualmente le informamos y recordamos que a todos los titulares de los datos personales
                se les reconocen sus Derechos ARCO, en todo momento los cuales consisten en los
                siguientes:
              </p>
              <ol className="list-[lower-alpha] space-y-2 pl-6">
                <li className="privacy-body">
                  Derecho a obtener información sobre sus datos personales y las condiciones de su
                  tratamiento.
                </li>
                <li className="privacy-body">Derecho a rectificar y corregir sus datos personales.</li>
                <li className="privacy-body">
                  Derecho a solicitar la cancelación de un dato falso, incompleto, irrelevante,
                  desfasado, o no pertinente.
                </li>
                <li className="privacy-body">
                  Derecho a oponerse a proporcionar sus datos o a que sean objeto de un determinado
                  tratamiento, así como revocar, sin efectos retroactivos, su consentimiento, siempre y
                  cuando obedezca a motivos fundados y legítimos.
                </li>
                <li className="privacy-body">
                  Derecho a la portabilidad, para lo cual podrá obtener copia de sus datos personales en
                  formatos genéricos y de uso común; mediante el canal de atención de reclamos o
                  solicitudes.
                </li>
              </ol>

              <p className="privacy-body">
                En cumplimiento de las disposiciones legales vigentes sobre Protección de Datos
                Personales en Panamá, por medio del presente Aviso de Privacidad, le informamos los
                términos y condiciones que emplea Banistmo en el tratamiento y Protección de sus datos
                personales; por lo cual, nos permitimos solicitarle leer detenidamente la siguiente
                información a saber:
              </p>

              <div className="space-y-3">
                <h3 className="privacy-heading uppercase text-black">
                  ¿Qué tipo de información recopilamos y tratamos?
                </h3>
                <p className="privacy-body">
                  Con motivo de la prestación de sus productos y servicios, así como por virtud de
                  cualquier relación jurídica, comercial, mercantil, civil, laboral, regulatoria o de
                  cualquier otra índole, que Banistmo sostenga con todas las personas con las que se
                  relaciona, en el giro de cualquiera de estas actividades, Banistmo obtiene de su titular
                  datos personales que permitan identificar o hacer identificables a sus clientes y
                  relacionados, como los son a manera enunciativa más no limitativa: nombres, apellidos,
                  alias, textos, imágenes, fotos, videos, voz, domicilios, números de documento de
                  identidad personal, certificaciones de nacimiento, datos de contactabilidad; y datos
                  sensibles, que a manera enunciativa más no limitativa, pueden revelar aspectos como:
                  origen racial o étnico; creencias o convicciones religiosas, filosóficas y morales,
                  afiliación sindical, opiniones políticas, datos relativos a la salud, la vida, preferencia
                  u orientación sexual, datos genéticos o datos biométricos, o cualquier otro dirigido a
                  identificar de manera unívoca a una persona natural.
                </p>
                <p className="privacy-body">
                  Aquellos datos que sean completamente anónimos o disociados, esto es, que no permitan
                  la identificación del individuo, ni directamente, ni a través de su combinación con
                  otros datos; no serán considerados como datos personales.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="privacy-heading uppercase text-black">
                  ¿Quién es el responsable del tratamiento de los datos personales recopilados?
                </h3>
                <p className="privacy-body">
                  Banistmo, de acuerdo a la Ley 81 sobre Protección de Datos Personales, y en virtud de la
                  relación directa o indirecta (jurídica, comercial, mercantil, civil, laboral, regulatoria o
                  de cualquier otra índole), que mantiene o mantuvo con usted, es la entidad responsable
                  del tratamiento de sus datos personales, y por tanto, en su condición de entidad
                  responsable, le corresponde las decisiones relacionadas con el tratamiento de los datos
                  personales que obtiene de todas las personas con las que se relaciona, determinando los
                  fines, medios y alcance del tratamiento de los datos personales obtenidos.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="privacy-heading uppercase text-black">
                  ¿Cuál es la finalidad y propósito del tratamiento de los datos personales que
                  recopilamos?
                </h3>
                <p className="privacy-body">
                  Los datos personales que Banistmo obtiene de su titular podrán ser compartidos o de
                  cualquier otra forma tratados con su casa matriz, o las siguientes entidades nacionales o
                  extranjeras (siempre que el país receptor cuente con un nivel de protección de datos
                  personales igual o superior): agencias de información de datos públicos o privados,
                  bancos, o agentes económicos, intermediarios financieros, aliados, proveedores de
                  servicios, entidades administrativas o judiciales siempre que esté legitimado por la Ley,
                  o, con previa autorización del titular, por los siguientes fines:
                </p>
                <ul className="list-disc space-y-2 pl-6">
                  <li className="privacy-body">Prevención de fraude y gestión de ciberseguridad.</li>
                  <li className="privacy-body">Gestionar todas las acciones inherentes a la Debida diligencia.</li>
                  <li className="privacy-body">Evaluación de riesgo.</li>
                  <li className="privacy-body">
                    Contactarle por los medios suministrados por usted, por información inherente a los
                    productos o servicios que Banistmo le presta u ofrece.
                  </li>
                  <li className="privacy-body">
                    Validar su identidad, en las interacciones con el titular de datos personales,
                    incluyendo para la ejecución, verificación y autorización de sus solicitudes y
                    operaciones.
                  </li>
                  <li className="privacy-body">
                    Ejecutar obligaciones derivadas de un contrato suscrito por el titular de datos
                    personales en la prestación de los productos y servicios con Banistmo, incluyendo la
                    entrega del servicio, la gestión del cobro de obligaciones, el procesamiento de pagos y
                    transferencias.
                  </li>
                  <li className="privacy-body">
                    Realizar las gestiones tendientes a establecer una relación contractual que nos haya
                    solicitado.
                  </li>
                  <li className="privacy-body">
                    Administrar los productos o servicios, así como entregarle información acerca de los
                    productos o servicios que mantiene.
                  </li>
                  <li className="privacy-body">
                    Compartirle información acerca de los productos y servicios que se ofrecen, y que
                    pudiesen ser de su interés.
                  </li>
                  <li className="privacy-body">
                    Notificarle los cambios relacionados con los productos y/o servicios que mantiene.
                  </li>
                  <li className="privacy-body">
                    Brindarle soporte en la atención de solicitudes, reclamos y requerimientos.
                  </li>
                  <li className="privacy-body">
                    Confirmarle y actualizar información de sus datos personales.
                  </li>
                  <li className="privacy-body">
                    Gestionar los riesgos a los cuales Banistmo está expuesto en el desarrollo de sus
                    negocios.
                  </li>
                  <li className="privacy-body">
                    Fines relacionados con la prevención del uso indebido de los productos y servicios,
                    incluyendo la prevención del fraude, el blanqueo de capitales, el financiamiento del
                    terrorismo y la proliferación de armas de destrucción masiva.
                  </li>
                  <li className="privacy-body">
                    Cumplir con las obligaciones legales, en materia prudencial, de intercambio de
                    información para fines fiscales o tributarios.
                  </li>
                  <li className="privacy-body">
                    Obtener, a través de terceros, servicios, recursos y capacidades; incluyendo
                    capacidades tecnológicas, uso de redes, de alojamiento, almacenamiento, procesamiento
                    y analítica de datos, así como servicios financieros, de asesoría, auditoría,
                    calificación de riesgos, administrativos, operativos y contables, entre otros.
                  </li>
                  <li className="privacy-body">
                    Obtener la colaboración empresarial de las empresas del Grupo, para la ejecución de
                    las actividades propias de nuestro negocio.
                  </li>
                  <li className="privacy-body">
                    El ejercicio de los derechos de Banistmo, incluyendo los procesos administrativos,
                    judiciales y tributarios.
                  </li>
                  <li className="privacy-body">
                    Fines estadísticos, luego de un proceso de disociación o anonimización.
                  </li>
                  <li className="privacy-body">
                    Definición, estructuración y ejecución de transacciones estratégicas para la operación,
                    modelo de negocio y oferta de servicios de Banistmo, lo cual podrá implicar la
                    transmisión o transferencia de los datos personales a entidades del Grupo y/o
                    terceros.
                  </li>
                  <li className="privacy-body">
                    Cualquier otra finalidad requerida para el desarrollo del objeto social de Banistmo y
                    para fines compatibles con los propósitos anteriores, incluyendo el uso de distintos
                    medios y canales, de acuerdo con los avances tecnológicos.
                  </li>
                  <li className="privacy-body">
                    Actividades de oferta comercial, publicidad, promoción o mercadeo de productos y
                    servicios, a través de distintos medios de comunicación y redes sociales.
                  </li>
                  <li className="privacy-body">
                    Desarrollo y optimización de productos, servicios y canales.
                  </li>
                  <li className="privacy-body">
                    Obtener, consultar, reportar, rectificar, modificar y eliminar el historial o
                    antecedentes de créditos, ante centrales de riesgo o agencias de información.
                  </li>
                  <li className="privacy-body">
                    Análisis o evaluación de crédito, investigaciones económicas y comerciales,
                    estadísticas, reputacionales y de mercado.
                  </li>
                  <li className="privacy-body">
                    Conocer el estado de sus operaciones, así como su comportamiento financiero,
                    comercial, reputacional, el cumplimiento de sus obligaciones, la imposición de multas
                    y sanciones, en otras entidades, tanto del Grupo como no vinculadas.
                  </li>
                  <li className="privacy-body">
                    Recopilar, registrar y en general procesar sus datos personales, para optimizar su
                    experiencia y conocer sus preferencias, monitorear su información, y para presentar
                    contenidos y publicidad relacionados con sus preferencias.
                  </li>
                  <li className="privacy-body">
                    Compartirla con aliados estratégicos, para que estos puedan ofrecerle beneficios y
                    servicios asociados a los productos y servicios de Banistmo.
                  </li>
                  <li className="privacy-body">
                    La toma de decisiones relevantes para el titular de datos personales, relacionadas con
                    la prestación de los productos y servicios, basadas exclusivamente en el procesamiento
                    automatizado de datos personales.
                  </li>
                  <li className="privacy-body">
                    Transferir datos personales a un país o jurisdicción distinta, donde quienes reciban
                    los datos personales no apliquen estándares equivalentes a los de Banistmo en materia
                    de protección de datos personales.
                  </li>
                  <li className="privacy-body">Realizar encuestas de satisfacción.</li>
                  <li className="privacy-body">
                    Entregar datos personales a favor de un tercero autorizado por el titular de los datos
                    personales, de forma estructurada, en formato genérico, de uso común y a través de
                    sistemas interoperables.
                  </li>
                  <li className="privacy-body">
                    Compartir información con terceros, tales como auditores, asesores, consultores,
                    contrapartes, aliados, proveedores, calificadoras y corresponsales.
                  </li>
                  <li className="privacy-body">
                    Obtención y procesamiento de datos sensibles, para todas las finalidades enunciadas.
                  </li>
                  <li className="privacy-body">
                    Compartir información con terceros, a solicitud del propio titular de datos personales
                    o su representante autorizado.
                  </li>
                </ul>
                <p className="privacy-body">
                  Para fines compatibles con los anteriores.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="privacy-heading uppercase text-black">
                  Consentimiento para la captura, recopilación y uso de imágenes
                </h3>
                <p className="privacy-body">
                  Este consentimiento podrá ser dado de manera escrita o verbal, dependiendo del canal de
                  comunicación que el titular utilice para contactarse con la organización, ya sea de
                  manera física o digital, o cualquier otro medio que la organización habilite para tales
                  efectos.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="privacy-heading uppercase text-black">
                  Condiciones especiales para el tratamiento de datos sensibles
                </h3>
                <p className="privacy-body">
                  Se entiende por datos sensibles toda información inherente a la intimidad del titular, y
                  se refiere de manera enunciativa a todos aquellos datos personales que puedan revelar
                  aspectos como el origen racial o étnico, creencias o convicciones religiosas, filosóficas
                  y morales, afiliación sindical, opiniones políticas, datos relativos a la salud y la vida,
                  preferencia u orientación sexual, datos genéticos o datos biométricos obtenidos mediante
                  fotos, imágenes, videos, voz o cualquier tratamiento técnico específico que permita
                  identificar las características físicas, fisiológicas o conductuales de una persona
                  natural dirigidos a identificarla de manera inequívoca.
                </p>
                <p className="privacy-body">
                  Por su naturaleza, comprendemos que el uso indebido de los datos sensibles puede dar
                  origen a actos discriminatorios o que conlleven un riesgo grave para su titular; razón por
                  la cual, los datos sensibles que recopilemos, mediante fotos, imágenes, videos, voz o
                  cualquier tratamiento técnico específico, no serán objeto de transferencia, publicación o
                  exhibición de forma total o parcial, con propósitos publicitarios, de marketing o
                  comercialización. Únicamente podrán ser objeto de transferencia en los casos siguientes:
                </p>
                <ul className="list-disc space-y-2 pl-6">
                  <li className="privacy-body">
                    Cuando el titular haya dado su autorización explícita, o que la Ley así lo permita.
                  </li>
                  <li className="privacy-body">
                    Cuando sea necesario para salvaguardar la vida del titular y este se encuentre física
                    o jurídicamente incapacitado, para lo cual los acudientes, curadores o quienes tengan
                    la tutela, deberán otorgar la autorización.
                  </li>
                  <li className="privacy-body">
                    Cuando se refiera a datos que sean necesarios para el reconocimiento, ejercicio o
                    defensa de un derecho con autorización judicial competente.
                  </li>
                  <li className="privacy-body">
                    Cuando tenga una finalidad histórica, estadística o científica, adoptando medidas para
                    disociar la identidad de los titulares.
                  </li>
                  <li className="privacy-body">
                    En el caso de menores de edad o personas con discapacidades legales, el consentimiento
                    será dado por el adulto o persona responsable.
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="privacy-heading uppercase text-black">
                  ¿Cuál es la vigencia y plazo para el tratamiento de sus datos personales?
                </h3>
                <p className="privacy-body">
                  Banistmo, dependiendo del producto o servicio, conservará y tratará sus datos personales
                  por el plazo que establezcan y permitan las normas de Prevención de Blanqueo de
                  Capitales, Financiamiento del Terrorismo, Proliferación de armas de destrucción masiva y
                  delitos conexos como Evasión Fiscal y Corrupción en Panamá, demás normas establecidas por
                  los entes reguladores y de supervisión y las leyes que regulen la Protección de Datos
                  Personales en Panamá.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="privacy-heading uppercase text-black">
                  Vigencia y modificaciones al Aviso de Privacidad
                </h3>
                <p className="privacy-body">
                  Las condiciones del presente aviso estarán vigentes a partir de su publicación, y
                  Banistmo se reserva el derecho de poder revisarlas para su actualización o modificaciones;
                  sus cambios entrarán en vigor inmediatamente después de su publicación y se aplicarán a
                  todo el acceso y uso del Sitio web.
                </p>
                <p className="privacy-body">
                  Su uso continuado del Sitio web después de la publicación de las Condiciones de Uso
                  revisadas significa que usted acepta y está de acuerdo con los cambios.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="privacy-heading uppercase text-black">Excepciones</h3>
                <p className="privacy-body">
                  De conformidad con la normativa legal existente en la República de Panamá, no se requerirá
                  autorización para el tratamiento de datos personales en los casos siguientes:
                </p>
                <ul className="list-disc space-y-2 pl-6">
                  <li className="privacy-body">
                    Los que provengan o que se recolecten de fuentes de dominio público o accesible en
                    medios públicos.
                  </li>
                  <li className="privacy-body">
                    Los que se recolecten dentro del ejercicio de las funciones propias de la Administración
                    Públicas en el ámbito de sus competencias.
                  </li>
                  <li className="privacy-body">
                    Los de carácter económico, financiero, bancario o comercial que se cuenten con el
                    consentimiento previo.
                  </li>
                  <li className="privacy-body">
                    Los que se contengan en listas relativas a una categoría de personas que se limiten a
                    indicar antecedentes.
                  </li>
                  <li className="privacy-body">
                    Los que son necesarios dentro de una relación comercial establecida, ya sea para la
                    atención directa, comercialización o venta de los bienes o servicios pactados.
                  </li>
                  <li className="privacy-body">
                    Cuando sea necesario para la aplicación de contratos en Banistmo en los que el titular de
                    los datos sea parte o tenga interés.
                  </li>
                  <li className="privacy-body">
                    El tratamiento de datos personales que se realicen organizaciones privadas para el uso
                    exclusivo de sus asociados.
                  </li>
                  <li className="privacy-body">Los casos de urgencia médica o sanitaria.</li>
                  <li className="privacy-body">
                    El tratamiento de información autorizado por la ley para fines históricos, estadísticos o
                    científicos.
                  </li>
                  <li className="privacy-body">
                    El tratamiento que sea necesario para la satisfacción de intereses legítimos perseguidos
                    por el responsable del tratamiento o por un tercero.
                  </li>
                  <li className="privacy-body">
                    Cuando el Consentimiento se refiera a datos personales sensibles de salud, el
                    consentimiento será previo, irrefutable y expreso.
                  </li>
                  <li className="privacy-body">
                    Para aquellos tratamientos cuya finalidad sea la de preservar la seguridad de las
                    personas y las instalaciones de Banistmo.
                  </li>
                  <li className="privacy-body">
                    Cuando el tratamiento sea necesario para el cumplimiento de requerimientos u
                    obligaciones exigidas por el ente regulador que corresponda a Banistmo.
                  </li>
                  <li className="privacy-body">
                    Cuando el tratamiento sea necesario para la debida administración y gestión de los
                    distintos riesgos.
                  </li>
                  <li className="privacy-body">
                    Cuando los datos sean utilizados o compartidos por Banistmo, con la propietaria de
                    acciones bancarias, subsidiarias u otra sociedad del grupo bancario para el ejercicio de
                    las funciones propias de la entidad, siempre que no sea para fines de mercadeo.
                  </li>
                  <li className="privacy-body">
                    Cuando el tratamiento esté basado en un interés legítimo de Banistmo derivado de la
                    relación o vínculo existente con el titular de datos personales.
                  </li>
                  <li className="privacy-body">
                    Cuando el tratamiento sea necesario para la transferencia, comunicación o interconexión de
                    los datos personales a un custodio de bases de datos, a un proveedor de servicios de
                    Banistmo o a terceros para la gestión de la relación contractual Banistmo–titular de
                    datos personales.
                  </li>
                  <li className="privacy-body">
                    Cuando el tratamiento de datos sea necesario para el cumplimiento de los requerimientos
                    establecidos por los entes reguladores para el intercambio de información con otros
                    organismos de supervisión financiera.
                  </li>
                  <li className="privacy-body">Los demás tratamientos establecidos por la Ley y la normativa que la desarrolla.</li>
                </ul>
                <p className="privacy-body">
                  Por otra parte, la remisión al titular de los datos de comunicación de carácter publicitaria,
                  comercial o de mercadeo sobre productos o servicios de Banistmo requerirá de su
                  consentimiento previo, informado e inequívoco.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="privacy-heading uppercase text-black">
                  Derechos del titular de los datos personales y los mecanismos para ejercerlos
                </h3>
                <p className="privacy-body">
                  A todos los titulares de los datos personales se les reconocen sus Derechos ARCO dentro de
                  Banistmo; éstos comprenden los derechos a acceso, rectificación, cancelación, oposición y
                  portabilidad (ARCO).
                </p>
                <p className="privacy-body">
                  Los requerimientos relacionados al procesamiento de datos personales serán atendidos de
                  forma gratuita, y dentro de los plazos razonables previstos en las normas. El carácter
                  gratuito de la atención de estos requerimientos podrá tener las limitaciones que
                  establezcan las normas aplicables a la materia. El derecho de los titulares de datos
                  personales a la atención de estos requerimientos es irrenunciable y solo podrá ser limitado
                  por norma.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="privacy-heading uppercase text-black">
                  Derecho de presentar reclamos sobre derechos ARCO
                </h3>
                <p className="privacy-body">
                  El titular de datos personales que considere vulnerado el ejercicio de los derechos ARCO
                  podrá presentar ante Banistmo, como responsable del tratamiento de los datos, toda
                  solicitud, reclamación, queja y controversia vinculada con la protección de datos
                  personales.
                </p>
                <p className="privacy-body">
                  En caso de que Banistmo no cumpla con atender la solicitud concerniente al ejercicio de los
                  Derechos ARCO o el titular de datos personales se encuentre disconforme con la decisión
                  adoptada por Banistmo, el mismo podrá interponer un reclamo ante su ente regulador. Para
                  tales fines, el titular de datos personales tendrá un plazo de 30 días calendario, los
                  cuales empezarán a regir a partir de la fecha en que obtuvo respuesta formal por parte de
                  Banistmo o cuando no hayamos cumplido con resolver la solicitud o reclamo en el plazo
                  correspondiente.
                </p>
                <p className="privacy-body">
                  Entes Reguladores:
                </p>
                <ul className="list-disc space-y-2 pl-6">
                  <li className="privacy-body">Banistmo, S.A.: Superintendencia de Bancos de Panamá.</li>
                  <li className="privacy-body">
                    Banistmo Investment Corporation, S.A.: Superintendencia de Bancos de Panamá.
                  </li>
                  <li className="privacy-body">Leasing Banistmo, S.A.: Superintendencia de Bancos de Panamá.</li>
                  <li className="privacy-body">Valores Banistmo, S.A.: Superintendencia de Valores de Panamá.</li>
                </ul>
              </div>

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
