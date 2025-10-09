"use client"

import { useEffect, useRef } from "react"

export const useSoundManager = () => {
  const audioContextRef = useRef<AudioContext | null>(null)
  const tranquilMusicRef = useRef<AudioBufferSourceNode | null>(null)

  const createSound = (frequency: number, duration: number, volume: number = 0.1) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      
      const oscillator = audioContextRef.current.createOscillator()
      const gainNode = audioContextRef.current.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContextRef.current.destination)
      
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime)
      
      gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime)
      gainNode.gain.linearRampToValueAtTime(volume, audioContextRef.current.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration)
      
      oscillator.start(audioContextRef.current.currentTime)
      oscillator.stop(audioContextRef.current.currentTime + duration)
    } catch (error) {
      console.warn('Audio context not available:', error)
    }
  }

  const playButtonClick = () => {
    createSound(800, 0.2, 0.05)
  }

  const playWalletConnect = () => {
    // Success sound - ascending chord
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      
      const frequencies = [400, 500, 600, 800]
      frequencies.forEach((freq, index) => {
        setTimeout(() => {
          createSound(freq, 0.3, 0.08)
        }, index * 50)
      })
    } catch (error) {
      console.warn('Audio context not available:', error)
    }
  }

  const playGlobeRotation = () => {
    createSound(200, 0.5, 0.02)
  }

  const startTranquilMusic = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      
      if (tranquilMusicRef.current) {
        tranquilMusicRef.current.stop()
      }

      const oscillator = audioContextRef.current.createOscillator()
      const gainNode = audioContextRef.current.createGain()
      const filter = audioContextRef.current.createBiquadFilter()
      
      oscillator.connect(filter)
      filter.connect(gainNode)
      gainNode.connect(audioContextRef.current.destination)
      
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(220, audioContextRef.current.currentTime)
      
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(400, audioContextRef.current.currentTime)
      
      gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.01, audioContextRef.current.currentTime + 2)
      
      oscillator.start(audioContextRef.current.currentTime)
      tranquilMusicRef.current = oscillator
    } catch (error) {
      console.warn('Audio context not available:', error)
    }
  }

  const stopTranquilMusic = () => {
    if (tranquilMusicRef.current) {
      tranquilMusicRef.current.stop()
      tranquilMusicRef.current = null
    }
  }

  useEffect(() => {
    return () => {
      stopTranquilMusic()
    }
  }, [])

  return {
    playButtonClick,
    playWalletConnect,
    playGlobeRotation,
    startTranquilMusic,
    stopTranquilMusic
  }
}
