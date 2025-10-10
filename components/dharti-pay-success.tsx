'use client'

import React, { useState, useEffect } from 'react'
import { CheckCircle } from 'lucide-react'
import { useSoundManager } from '@/components/sound-manager'

interface DhartiPaySuccessProps {
  onComplete: () => void
}

export default function DhartiPaySuccess({ onComplete }: DhartiPaySuccessProps) {
  const { playButtonClick } = useSoundManager()
  const [currentStep, setCurrentStep] = useState(0)
  const [showTick, setShowTick] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    playButtonClick() // Play sound on mount
    
    const timer1 = setTimeout(() => {
      setCurrentStep(1) // Show "DhartiPay" text
    }, 500)

    const timer2 = setTimeout(() => {
      setShowTick(true) // Show tick mark
    }, 2000)

    const timer3 = setTimeout(() => {
      setShowSuccess(true) // Show success message
    }, 3000)

    const timer4 = setTimeout(() => {
      onComplete() // Complete animation and redirect
    }, 5000)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
    }
  }, [onComplete, playButtonClick])

  return (
    <div className="fixed inset-0 bg-black z-[9999] flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="holo-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
      
      <div className="text-center space-y-8 relative z-10 max-w-md w-full">
        {/* DhartiPay Title */}
        {currentStep >= 1 && (
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              <span className="inline-block animate-pulse">Dharti</span>
              <span className="inline-block ml-2 md:ml-4 text-blue-400">Pay</span>
            </h1>
            <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mx-auto max-w-md"></div>
          </div>
        )}

        {/* Tick Animation */}
        {showTick && (
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-16 h-16 md:w-24 md:h-24 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                <CheckCircle className="w-10 h-10 md:w-16 md:h-16 text-white animate-bounce" />
              </div>
              <div className="absolute inset-0 w-16 h-16 md:w-24 md:h-24 bg-green-500 rounded-full animate-ping opacity-30"></div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {showSuccess && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-2xl md:text-3xl font-bold text-green-400">Payment Successful!</h2>
            <p className="text-lg md:text-xl text-gray-300">Your land purchase has been completed</p>
            <div className="flex justify-center">
              <div className="w-6 h-6 md:w-8 md:h-8 border-4 border-green-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        )}

        {/* Loading Dots */}
        {currentStep >= 1 && !showSuccess && (
          <div className="flex justify-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        )}
      </div>
    </div>
  )
}
