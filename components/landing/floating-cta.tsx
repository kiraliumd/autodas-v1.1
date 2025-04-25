"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Clock } from "lucide-react"

export function FloatingCTA() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Mostrar o banner quando o usuário rolar mais de 500px
      if (window.scrollY > 500) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg py-3 px-4 z-50 transition-all duration-300 transform animate-slide-up">
      <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="bg-amber-100 border border-amber-300 rounded-full p-2">
            <Clock className="h-5 w-5 text-amber-700" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Oferta por tempo limitado!</p>
            <p className="text-sm text-gray-700">Restam apenas 23 vagas com preço promocional</p>
          </div>
        </div>
        <Link href="/checkout">
          <Button className="whitespace-nowrap rounded-[8px] hover:scale-105 transition-transform">ASSINE AGORA</Button>
        </Link>
      </div>
    </div>
  )
}
