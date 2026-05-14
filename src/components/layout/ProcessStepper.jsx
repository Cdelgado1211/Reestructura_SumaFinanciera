import React from 'react'

export default function ProcessStepper({ current = 1 }) {
  const steps = [
    { id: 1, label: 'Plan de pago' },
    { id: 2, label: 'Verificación' },
    { id: 3, label: 'Términos y condiciones' },
  ]

  return (
    <nav aria-label="Progreso del flujo">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Proceso</p>
      <ol className="mt-3 space-y-3">
        {steps.map((step) => {
          const isActive = step.id === current
          const isDone = step.id < current

          return (
            <li key={step.id} className="flex items-center gap-3">
              <span
                className={[
                  'flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold',
                  isActive
                    ? 'border-brand-500 bg-brand-500 text-white'
                    : isDone
                      ? 'border-brand-400 bg-brand-100 text-brand-700'
                      : 'border-gray-300 bg-white text-gray-500',
                ].join(' ')}
                aria-hidden="true"
              >
                {step.id}
              </span>
              <span className={isActive ? 'text-sm font-semibold text-gray-900' : 'text-sm text-gray-600'}>
                {step.label}
              </span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
