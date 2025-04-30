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
  // Assumindo que 77% das vagas já foram preenchidas (23 vagas restantes de 100)
  const filledPercentage = 77

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

  // Formatar o tempo restante como uma string
  const formatTimeLeft = () => {
    if (isExpired) return "Oferta encerrada"

    const { days, hours, minutes, seconds } = timeLeft
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m ${seconds}s restantes`
    } else {
      return `${hours}h ${minutes}m ${seconds}s restantes`
    }
  }

  if (isExpired) {
    return (
      <div className={`text-center ${className}`}>
        <p className="text-red-600 font-medium">Oferta encerrada!</p>
      </div>
    )
  }

  return (
    <div className={`text-center ${className}`}>
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-medium text-gray-700">Oferta por tempo limitado</p>
          <p className="text-sm font-medium text-primary">{formatTimeLeft()}</p>
        </div>

        {/* Barra de progresso para vagas preenchidas */}
        <div className="h-6 w-full bg-gray-200 rounded-full overflow-hidden relative">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500 ease-in-out flex items-center justify-center"
            style={{ width: `${filledPercentage}%` }}
          >
            <span className="text-xs font-bold text-white">{filledPercentage}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
