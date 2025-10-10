'use client'

import { useState, useEffect } from 'react'
import { WalletProvider } from "@/contexts/wallet-context"
import MainPageContent from "@/components/main-page-content"
import SimpleKYC from "@/components/simple-kyc"
import ClientEntryLoader from "@/components/client-entry-loader"

export default function Page() {
  const [showKYC, setShowKYC] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showMain, setShowMain] = useState(false)

  useEffect(() => {
    // Check if KYC is already verified
    const isKYCVerified = localStorage.getItem('kyc_verified') === 'true'
    
    // For testing: Uncomment the line below to always show KYC
    // localStorage.removeItem('kyc_verified')
    
    if (isKYCVerified) {
      // Skip KYC, go directly to main page
      setShowKYC(false)
      setIsLoading(false)
      setShowMain(true)
    } else {
      // Show loading screen for 4 seconds, then show KYC
      const timer = setTimeout(() => {
        setIsLoading(false)
        setShowKYC(true)
      }, 4000)
      
      return () => clearTimeout(timer)
    }
  }, [])

  const handleKYCComplete = () => {
    setShowKYC(false)
    setShowMain(true)
  }

  if (isLoading) {
    return <ClientEntryLoader />
  }

  if (showKYC) {
    return <SimpleKYC onComplete={handleKYCComplete} />
  }

  if (showMain) {
    return (
      <WalletProvider>
        <div className="relative">
          {/* Temporary KYC Reset Button for Testing */}
          <button 
            onClick={() => {
              localStorage.removeItem('kyc_verified')
              window.location.reload()
            }}
            className="fixed top-4 right-4 z-50 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
          >
            Reset KYC
          </button>
          <MainPageContent />
        </div>
      </WalletProvider>
    )
  }

  return null
}
