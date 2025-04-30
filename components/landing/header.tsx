"use client"

import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { StripeCheckoutButton } from "@/components/stripe-checkout-button"

export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <header className="w-full bg-white py-4 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto max-w-[1120px] flex items-center justify-between">
        <Logo />

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="#benefits" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
            Benefícios
          </Link>
          <Link href="#pricing" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
            Plano
          </Link>
          <Link href="/login" className="text-sm font-medium">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/5 rounded-[8px]">
              Entrar
            </Button>
          </Link>
          <StripeCheckoutButton className="text-sm font-medium rounded-[8px] px-6 hover:scale-105 transition-transform">
            Assinar Agora
          </StripeCheckoutButton>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-gray-700 p-2" onClick={toggleMobileMenu} aria-label="Menu">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white py-4 px-6 shadow-md animate-slide-up">
          <nav className="flex flex-col space-y-4">
            <Link
              href="#benefits"
              className="text-sm font-medium text-gray-700 hover:text-primary py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Benefícios
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-gray-700 hover:text-primary py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Plano
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-gray-700 hover:text-primary py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Entrar
            </Link>
            <StripeCheckoutButton
              className="w-full text-sm font-medium rounded-[8px]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Assinar Agora
            </StripeCheckoutButton>
          </nav>
        </div>
      )}
    </header>
  )
}
