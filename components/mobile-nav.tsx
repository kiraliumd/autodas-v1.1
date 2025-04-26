"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Home, Settings, LogOut, HelpCircle } from "lucide-react"
import { useAuth } from "@/components/auth/auth-context"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { signOut } = useAuth()

  const routes = [
    {
      href: "/dashboard",
      label: "Visão Geral",
      icon: Home,
    },
    {
      href: "/dashboard/settings",
      label: "Configurações",
      icon: Settings,
    },
    {
      href: "/central-de-ajuda",
      label: "Precisa de Ajuda?",
      icon: HelpCircle,
    },
  ]

  // Variantes de animação para os itens do menu
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden transition-all duration-200 hover:bg-gray-100 active:scale-95"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[240px] sm:w-[300px] pr-0 border-r shadow-lg transition-transform duration-300 ease-in-out"
      >
        <div className="flex flex-col gap-4 py-4">
          <div className="px-4 mb-2">
            <h2 className="text-lg font-semibold">Menu</h2>
          </div>
          <motion.nav
            className="flex flex-col gap-2 px-2"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {routes.map((route, index) => (
              <motion.div key={route.href} variants={itemVariants}>
                <Link
                  href={route.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                    pathname === route.href
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted active:scale-[0.98]",
                  )}
                >
                  <route.icon className="h-4 w-4" />
                  {route.label}
                </Link>
              </motion.div>
            ))}
            <motion.div variants={itemVariants}>
              <Button
                variant="ghost"
                className="flex w-full items-center gap-2 px-3 py-2 rounded-md text-sm font-medium justify-start transition-all duration-200 hover:bg-muted active:scale-[0.98]"
                onClick={() => {
                  setOpen(false)
                  signOut()
                }}
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </motion.div>
          </motion.nav>
        </div>
      </SheetContent>
    </Sheet>
  )
}
