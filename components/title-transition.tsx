"use client"

import { useEffect, useMemo, useRef, useState } from "react"

export default function TitleTransition() {
  const [idx, setIdx] = useState(0)
  const [blink, setBlink] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showMainTitle, setShowMainTitle] = useState(false)
  const titleRef = useRef<HTMLDivElement | null>(null)

  const dhartiTranslations = useMemo(
    () => [
      "Dharti", 
      "धरती", 
      "தர்தி", 
      "ధర్తి", 
      "ધર્તી", 
      "ধর্তি", 
      "धर्ती", 
      "धरती", 
      "Dharti"
    ],
    [],
  )

  useEffect(() => {
    // Start transition after loading screen
    const transitionTimer = setTimeout(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setShowMainTitle(true)
      }, 1000)
    }, 4000) // After loading screen duration

    return () => clearTimeout(transitionTimer)
  }, [])

  useEffect(() => {
    const createTransitionSound = () => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.type = 'sine'
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
        oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.2)
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime)
        gainNode.gain.linearRampToValueAtTime(0.03, audioContext.currentTime + 0.05)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
        
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.2)
      } catch (error) {
        console.warn('Audio context not available:', error)
      }
    }

    const i = setInterval(() => {
      setBlink(true)
      createTransitionSound()
      setTimeout(() => {
        setIdx((p) => (p + 1) % dhartiTranslations.length)
        setBlink(false)
      }, 300)
    }, 2000)
    return () => clearInterval(i)
  }, [dhartiTranslations.length])

  if (!showMainTitle) {
    return (
      <div 
        ref={titleRef}
        className={`fixed inset-0 z-[60] bg-black flex items-center justify-center transition-all duration-1000 ease-in-out ${
          isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
      >
        <div className="text-center">
          <div className="text-xs tracking-[0.35em] text-gray-400 mb-8">INITIALIZING</div>
          <div className="relative">
            <h1 className="text-6xl font-semibold md:text-8xl text-amber-50 flex items-baseline justify-center">
              <span
                className={
                  "transition-all duration-500 ease-in-out relative inline-block " +
                  (blink ? "opacity-0 scale-95" : "opacity-100 scale-100")
                }
                style={{ 
                  fontFamily: 'serif',
                  fontWeight: 'normal',
                  fontStyle: 'italic'
                }}
              >
                {dhartiTranslations[idx]}
                <div 
                  className="absolute -bottom-2 left-0 right-0 h-1 rounded-full"
                  style={{ 
                    background: 'linear-gradient(90deg, #ef4444, #dc2626)',
                    boxShadow: '0 0 8px rgba(239, 68, 68, 0.5)'
                  }}
                />
              </span>
              <span 
                className="ml-2 font-black uppercase tracking-widest flex-shrink-0" 
                style={{ 
                  fontFamily: 'sans-serif',
                  fontWeight: '900',
                  letterSpacing: '0.1em',
                  minWidth: 'fit-content'
                }}
              >
                Link
              </span>
            </h1>
            <div className="mx-auto mt-12 h-1 w-40 overflow-hidden rounded-full bg-gray-800">
              <div 
                className="h-full transition-all duration-75 ease-out"
                style={{ 
                  width: '100%',
                  background: 'linear-gradient(90deg, #00e5ff, #6cf2ff)',
                  boxShadow: '0 0 8px rgba(0, 229, 255, 0.5)'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <h1 className="text-pretty text-4xl font-semibold tracking-tight md:text-6xl holo-glow">
      <div className="flex items-baseline">
        <span
          className={
            "transition-all duration-500 ease-in-out relative inline-block " +
            (blink ? "opacity-0 scale-95" : "opacity-100 scale-100")
          }
          style={{ 
            fontFamily: 'serif',
            fontWeight: 'normal',
            fontStyle: 'italic'
          }}
        >
          {dhartiTranslations[idx]}
          <div 
            className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full"
            style={{ 
              background: 'linear-gradient(90deg, #ef4444, #dc2626)',
              boxShadow: '0 0 4px rgba(239, 68, 68, 0.5)'
            }}
          />
        </span>
        <span 
          className="ml-2 font-black uppercase tracking-widest flex-shrink-0" 
          style={{ 
            fontFamily: 'sans-serif',
            fontWeight: '900',
            letterSpacing: '0.1em',
            minWidth: 'fit-content'
          }}
        >
          Link
        </span>
      </div>
      <span className="text-sm md:text-base text-accent-foreground/70 font-medium tracking-wide uppercase">
        UPI for Land Ownership
      </span>
    </h1>
  )
}
