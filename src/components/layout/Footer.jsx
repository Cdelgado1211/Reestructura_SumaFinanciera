import React from 'react'

function Footer() {
  return (
    <footer className='bg-gray-800 text-white text-sm py-4 mt-6'>
      <div className='container mx-auto flex flex-col gap-3 text-center px-4 md:flex-row md:items-center md:justify-center md:gap-8 md:text-left'>
        <a
          href='https://www.sumafinanciera.com/acerca-de/terminos-y-condiciones-de-uso'
          className='underline'
          target='_blank'
          rel='noopener noreferrer'
        >
          Términos y condiciones
        </a>
        <span className='flex items-center justify-center gap-2'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            aria-hidden='true'
            className='h-5 w-5'
            stroke='currentColor'
            strokeWidth='1.5'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M2.25 6.75c0 8.284 6.716 15 15 15h0a1.5 1.5 0 0 0 1.5-1.5v-2.25a1.5 1.5 0 0 0-1.28-1.48l-3.013-.502a1.5 1.5 0 0 0-1.338.432l-.665.665a11.25 11.25 0 0 1-5.313-5.313l.665-.665a1.5 1.5 0 0 0 .432-1.338l-.502-3.013A1.5 1.5 0 0 0 8.25 4.5H6a1.5 1.5 0 0 0-1.5 1.5v.75Z'
            />
          </svg>
          Conciliación con los clientes (507) 233-8510 / 8520
        </span>
        <span className='text-center md:text-left'>Copyright © 2025 Suma Financiera</span>
      </div>
    </footer>
  )
}

export default Footer
