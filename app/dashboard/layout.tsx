"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardNav } from "@/components/dashboard-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader />

      <div className="flex-1 container py-8">
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
          <aside className="hidden md:block">
            <DashboardNav currentPath={pathname} />
          </aside>
          <main className="w-full min-h-[calc(100vh-10rem)]">{children}</main>
        </div>
      </div>
    </div>
  )
}
