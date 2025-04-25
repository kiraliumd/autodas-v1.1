"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Home, Settings, LogOut } from "lucide-react"
import { useAuth } from "@/components/auth/auth-context"
import { cn } from "@/lib/utils"

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
  ]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[240px] sm:w-[300px] pr-0">
        <div className="flex flex-col gap-4 py-4">
          <div className="px-4 mb-2">
            <h2 className="text-lg font-semibold">Menu</h2>
          </div>
          <nav className="flex flex-col gap-2 px-2">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === route.href ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                )}
              >
                <route.icon className="h-4 w-4" />
                {route.label}
              </Link>
            ))}
            <Button
              variant="ghost"
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium justify-start hover:bg-muted"
              onClick={() => {
                setOpen(false)
                signOut()
              }}
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  )
}
