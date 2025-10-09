"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Howl } from "howler"

export default function EntryLoader() {
  const [visible, setVisible] = useState(true)
  const [idx, setIdx] = useState(0)
  const [blink, setBlink] = useState(false)
  const [progress, setProgress] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const soundRef = useRef<Howl | null>(null)

  const dhartiTranslations = useMemo(
    () => ["Dharti", "धरती", "தர்தி", "ధర్తి", "Dharti", "Dharti"],
    [],
  )
  // Create holographic sound using Web Audio API
  useEffect(() => {
    if (typeof window === "undefined") return
    
    const createHoloSound = () => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        const filter = audioContext.createBiquadFilter()
        
        oscillator.connect(filter)
        filter.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        // Holographic sound characteristics
        oscillator.type = 'sine'
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
        oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.2)
        
        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(2000, audioContext.currentTime)
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime)
        gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.05)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
        
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.2)
      } catch (error) {
        console.warn('Audio context not available:', error)
      }
    }

    // Play initial sound
    setTimeout(() => {
      createHoloSound()
    }, 500)

    return () => {
      // Cleanup handled by Web Audio API
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 4000)
    
    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 1
        return newProgress > 100 ? 100 : newProgress
      })
    }, 40) // 4000ms / 100 = 40ms per 1%
    
    return () => {
      clearTimeout(t)
      clearInterval(progressInterval)
    }
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
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime)
        oscillator.frequency.exponentialRampToValueAtTime(1500, audioContext.currentTime + 0.15)
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime)
        gainNode.gain.linearRampToValueAtTime(0.05, audioContext.currentTime + 0.02)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15)
        
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.15)
      } catch (error) {
        console.warn('Audio context not available:', error)
      }
    }

    const i = setInterval(() => {
      setBlink(true)
      // Play transition sound on language change
      createTransitionSound()
      setTimeout(() => {
        setIdx((p) => (p + 1) % dhartiTranslations.length)
        setBlink(false)
      }, 150)
    }, 800)
    return () => clearInterval(i)
  }, [dhartiTranslations.length])


  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[60] bg-black">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xs tracking-[0.35em] text-gray-400 mb-8">INITIALIZING</div>
          <div className="relative">
            <h1 className="text-6xl font-semibold md:text-8xl text-amber-50 flex items-baseline justify-center">
              <span
                className={
                  "transition-opacity duration-200 relative " +
                  (blink ? "opacity-0" : "opacity-100")
                }
                style={{ 
                  fontFamily: 'serif',
                  fontWeight: 'normal',
                  fontStyle: 'italic'
                }}
              >
                {dhartiTranslations[idx]}
                {/* Red underline only under Dharti */}
                <div 
                  className="absolute -bottom-2 left-0 right-0 h-1 rounded-full"
                  style={{ 
                    background: 'linear-gradient(90deg, #ef4444, #dc2626)',
                    boxShadow: '0 0 8px rgba(239, 68, 68, 0.5)'
                  }}
                />
              </span>
              <span 
                className="ml-2 font-black uppercase tracking-widest" 
                style={{ 
                  fontFamily: 'sans-serif',
                  fontWeight: '900',
                  letterSpacing: '0.1em'
                }}
              >
                Link
              </span>
            </h1>
          </div>
          <div className="mx-auto mt-12 h-1 w-40 overflow-hidden rounded-full bg-gray-800">
            <div 
              className="h-full transition-all duration-75 ease-out"
              style={{ 
                width: `${progress}%`,
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