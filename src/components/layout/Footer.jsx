import React from 'react'

function Footer() {
  return (
    <footer className='mt-6 border-t border-slate-200/80 bg-brand-700 text-white text-sm'>
      <div className='mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 text-center sm:px-6 md:flex-row md:items-center md:justify-center md:gap-8 md:text-left'>
        <a
          href='https://es.danaconnect.com/'
          className='font-medium text-white underline decoration-white/70 underline-offset-4 hover:text-white'
          target='_blank'
          rel='noopener noreferrer'
        >
          Términos y condiciones
        </a>
        <span className='text-center text-white/90 md:text-left'>Copyright © 2025 Example Insurance</span>
      </div>
    </footer>
  )
}

export default Footer
