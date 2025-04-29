"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LayoutDashboard, Users, Mail, LogOut, Settings } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"

interface AdminSidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  return (
    <div className={cn("flex h-screen flex-col border-r bg-background", className)}>
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="text-xl font-bold">Autodas</span>
          <span className="text-xs bg-primary text-primary-foreground px-1 rounded">Admin</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 py-2">
        <nav className="grid gap-1 px-2">
          <Link
            href="/admin/dashboard"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              pathname === "/admin/dashboard" ? "bg-accent text-accent-foreground" : "transparent",
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            href="/admin/users"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              pathname === "/admin/users" ? "bg-accent text-accent-foreground" : "transparent",
            )}
          >
            <Users className="h-4 w-4" />
            Usuários
          </Link>
          <Link
            href="/admin/recovery-emails"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              pathname === "/admin/recovery-emails" ? "bg-accent text-accent-foreground" : "transparent",
            )}
          >
            <Mail className="h-4 w-4" />
            Emails de Recuperação
          </Link>
          <Link
            href="/admin/settings"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              pathname === "/admin/settings" ? "bg-accent text-accent-foreground" : "transparent",
            )}
          >
            <Settings className="h-4 w-4" />
            Configurações
          </Link>
        </nav>
      </ScrollArea>
      <div className="mt-auto p-4">
        <Button variant="outline" className="w-full justify-start" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  )
}
