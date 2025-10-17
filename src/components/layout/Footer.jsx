import React from 'react'

function Footer() {
  return (
    <footer className='bg-gray-800 text-white text-sm py-4 mt-6'>
      <div className='container mx-auto flex flex-col md:flex-row justify-between items-center px-4'>
        <a
          href='https://www.banistmo.com/acerca-de/terminos-y-condiciones-de-uso'
          className='underline mb-2 md:mb-0'
          target='_blank'
          rel='noopener noreferrer'
        >
          Términos y condiciones
        </a>
        <span>Sucursal Telefónica (507) 306-4700</span>
        <span>Copyright © 2025 Banistmo</span>
      </div>
    </footer>
  )
}

export default Footer
