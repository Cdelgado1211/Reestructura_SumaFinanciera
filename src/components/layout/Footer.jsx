import React from 'react'

function Footer() {
  return (
    <footer className='bg-gray-800 text-white text-sm py-4 mt-6'>
      <div className='container mx-auto flex flex-col gap-3 text-center px-4 md:flex-row md:items-center md:justify-center md:gap-8 md:text-left'>
        <a
          href='https://www.banistmo.com/acerca-de/terminos-y-condiciones-de-uso'
          className='underline'
          target='_blank'
          rel='noopener noreferrer'
        >
          Términos y condiciones
        </a>
        <span className='flex items-center justify-center gap-2'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 20 20'
            fill='currentColor'
            aria-hidden='true'
            className='h-5 w-5'
          >
            <path d='M2.003 5.884C2.003 3.742 3.745 2 5.887 2h1.313c.834 0 1.54.586 1.671 1.41l.611 3.822a1.75 1.75 0 0 1-.883 1.823l-1.02.566a.75.75 0 0 0-.278 1.04 11.48 11.48 0 0 0 4.536 4.536.75.75 0 0 0 1.04-.278l.566-1.02a1.75 1.75 0 0 1 1.823-.883l3.822.611c.824.132 1.41.837 1.41 1.672v1.312c0 2.142-1.742 3.884-3.884 3.884h-.5c-8.284 0-15-6.716-15-15v-.5Z' />
          </svg>
          Sucursal Telefónica (507) 306-4700
        </span>
        <span className='text-center md:text-left'>Copyright © 2025 Banistmo</span>
      </div>
    </footer>
  )
}

export default Footer
