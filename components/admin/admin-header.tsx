"use client"

import { useState } from "react"
import { Bell, Search, Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { AdminSidebar } from "./admin-sidebar"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function AdminHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2 md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <AdminSidebar />
          </SheetContent>
        </Sheet>
      </div>
      <div className="hidden md:block">
        <SidebarTrigger />
      </div>
      <div className="flex flex-1 items-center gap-4 md:ml-auto md:gap-6 md:max-w-md">
        <form className="hidden flex-1 md:flex">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Pesquisar..."
              className="w-full bg-background pl-8 md:w-[300px] lg:w-[400px]"
            />
          </div>
        </form>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-primary" />
          <span className="sr-only">Notificações</span>
        </Button>
      </div>
    </header>
  )
}
