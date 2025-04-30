"use client"

import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut } from "lucide-react"
import { useAuth } from "@/components/auth/auth-context"
import { MobileNav } from "@/components/mobile-nav"

export function DashboardHeader() {
  const { user, profile, signOut } = useAuth()

  // Obter as iniciais do nome do usuário
  const getInitials = () => {
    if (!profile?.full_name) return user?.email?.substring(0, 2).toUpperCase() || "U"

    const nameParts = profile.full_name.split(" ")
    if (nameParts.length === 1) return nameParts[0].substring(0, 2).toUpperCase()
    return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
  }

  return (
    <header className="border-b bg-white">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <MobileNav />
          <Logo />
        </div>

        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary">{getInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{profile?.full_name || "Usuário"}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
