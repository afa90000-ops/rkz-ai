'use client'
import { useCallback, useEffect, useRef, useState } from 'react'

type VoiceCommand = {
  keywords: string[]
  action: () => void
}

type UseVoiceCommandsOptions = {
  commands?: VoiceCommand[]
  lang?: string
  continuous?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecognition = any

export function useVoiceCommands({ commands = [], lang = 'ar-SA', continuous = false }: UseVoiceCommandsOptions = {}) {
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [supported, setSupported] = useState(false)
  const recognitionRef = useRef<AnyRecognition>(null)
  const commandsRef = useRef(commands)
  commandsRef.current = commands

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition
    setSupported(!!SR)
  }, [])

  const start = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition
    if (!SR) {
      setError('المتصفح لا يدعم التعرف على الصوت')
      return
    }

    const recognition = new SR()
    recognition.lang = lang
    recognition.continuous = continuous
    recognition.interimResults = true

    recognition.onstart = () => {
      setListening(true)
      setError(null)
    }

    recognition.onresult = (event: AnyRecognition) => {
      const last = event.results[event.results.length - 1]
      const text = last[0].transcript.toLowerCase() as string
      setTranscript(text)

      if (last.isFinal) {
        for (const cmd of commandsRef.current) {
          if (cmd.keywords.some((k: string) => text.includes(k.toLowerCase()))) {
            cmd.action()
            break
          }
        }
      }
    }

    recognition.onerror = (event: AnyRecognition) => {
      setError(event.error === 'no-speech' ? 'لم يتم اكتشاف صوت' : `خطأ: ${event.error}`)
      setListening(false)
    }

    recognition.onend = () => setListening(false)

    recognitionRef.current = recognition
    recognition.start()
  }, [lang, continuous])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
    setListening(false)
  }, [])

  return { listening, transcript, error, supported, start, stop }
}
