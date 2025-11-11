import React, { useRef } from 'react'

export default function DatePickerButton({ value, onChange, placeholder = '', ariaLabel = '' }) {
  const inputRef = useRef(null)

  const handleClick = () => {
    if (inputRef.current) {
      if (typeof inputRef.current.showPicker === 'function') {
        inputRef.current.showPicker()
      } else {
        inputRef.current.focus()
        inputRef.current.click()
      }
    }
  }

  const handleInputChange = (event) => {
    const nextValue = event.target.value
    onChange?.(nextValue)
  }

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="date"
        value={value || ''}
        onChange={handleInputChange}
        className="absolute inset-0 h-full w-full opacity-0 pointer-events-none"
        aria-hidden="true"
        tabIndex={-1}
      />
      <button
        type="button"
        onClick={handleClick}
        className="w-full text-left bg-transparent outline-none text-sm sm:text-base"
        aria-label={ariaLabel}
      >
        {value ? (
          <span className="text-gray-900">{formatDateForDisplay(value)}</span>
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}
      </button>
    </div>
  )
}

function formatDateForDisplay(isoDate) {
  if (!isoDate) return ''
  const [year, month, day] = isoDate.split('-')
  if (!year || !month || !day) return ''
  return `${day}-${month}-${year}`
}
