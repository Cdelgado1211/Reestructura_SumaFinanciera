import React, { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'

import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import IntroVerification from './pages/IntroVerification'
import VerificationMethod from './pages/VerificationMethod'
import VerificationCode from './pages/VerificationCode'
import PrivacyConsent from './pages/PrivacyConsent'
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
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<IntroVerification />} />
          <Route path="/metodo-verificacion" element={<VerificationMethod />} />
          <Route path="/codigo-verificacion" element={<VerificationCode />} />
          <Route path="/aviso-privacidad" element={<PrivacyConsent />} />
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
