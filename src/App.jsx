import React, { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'

import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import IntroVerification from './pages/IntroVerification'
import VerificationMethod from './pages/VerificationMethod'
import VerificationCode from './pages/VerificationCode'
import PlanSelection from './pages/PlanSelection'
import Verification from './pages/Verification'
import Contract from './pages/Contract'
import LoadingAdjust from './pages/LoadingAdjust'
import Confirmation from './pages/Confirmation'
import ErrorScreen from './pages/ErrorScreen'

function App() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [location.pathname])

  return (
    <div className="app-shell relative flex min-h-screen flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-brand-100/55 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-72 w-72 rounded-full bg-slate-300/50 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-brand-200/55 blur-3xl" />
      </div>

      <Header />
      <main className="relative z-10 mx-auto w-full max-w-6xl flex-grow px-4 py-8 sm:px-6 sm:py-10">
        <Routes>
          <Route path="/" element={<IntroVerification />} />
          <Route path="/metodo-verificacion" element={<VerificationMethod />} />
          <Route path="/codigo-verificacion" element={<VerificationCode />} />
          <Route path="/plan" element={<PlanSelection />} />
          <Route path="/verificacion" element={<Verification />} />
          <Route path="/contrato" element={<Contract />} />
          <Route path="/ajustando" element={<LoadingAdjust />} />
          <Route path="/confirmacion" element={<Confirmation />} />
          <Route path="/error" element={<ErrorScreen />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
