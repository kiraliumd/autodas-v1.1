"use client"

import { useEffect, useState } from "react"

interface CountdownTimerProps {
  targetDate: Date
  className?: string
}

export function CountdownTimer({ targetDate, className }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime()

      if (difference <= 0) {
        setIsExpired(true)
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        }
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      }
    }

    // Atualizar o contador inicialmente
    setTimeLeft(calculateTimeLeft())

    // Configurar o intervalo para atualizar o contador a cada segundo
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    // Limpar o intervalo quando o componente for desmontado
    return () => clearInterval(timer)
  }, [targetDate])

  if (isExpired) {
    return (
      <div className={`text-center ${className}`}>
        <p className="text-red-600 font-medium">Oferta encerrada!</p>
      </div>
    )
  }

  return (
    <div className={`text-center ${className}`}>
      <p className="text-gray-800 mb-3 font-medium">Oferta por tempo limitado:</p>
      <div className="flex justify-center gap-2 md:gap-4">
        <div className="flex flex-col items-center animate-slide-up delay-100">
          <div className="bg-primary text-white text-xl md:text-2xl font-bold rounded-lg w-14 md:w-16 h-14 md:h-16 flex items-center justify-center shadow-md">
            {String(timeLeft.days).padStart(2, "0")}
          </div>
          <span className="text-xs mt-1 text-gray-700 font-medium">Dias</span>
        </div>
        <div className="flex flex-col items-center animate-slide-up delay-200">
          <div className="bg-primary text-white text-xl md:text-2xl font-bold rounded-lg w-14 md:w-16 h-14 md:h-16 flex items-center justify-center shadow-md">
            {String(timeLeft.hours).padStart(2, "0")}
          </div>
          <span className="text-xs mt-1 text-gray-700 font-medium">Horas</span>
        </div>
        <div className="flex flex-col items-center animate-slide-up delay-300">
          <div className="bg-primary text-white text-xl md:text-2xl font-bold rounded-lg w-14 md:w-16 h-14 md:h-16 flex items-center justify-center shadow-md">
            {String(timeLeft.minutes).padStart(2, "0")}
          </div>
          <span className="text-xs mt-1 text-gray-700 font-medium">Min</span>
        </div>
        <div className="flex flex-col items-center animate-slide-up delay-400">
          <div className="bg-primary text-white text-xl md:text-2xl font-bold rounded-lg w-14 md:w-16 h-14 md:h-16 flex items-center justify-center shadow-md">
            {String(timeLeft.seconds).padStart(2, "0")}
          </div>
          <span className="text-xs mt-1 text-gray-700 font-medium">Seg</span>
        </div>
      </div>
    </div>
  )
}
