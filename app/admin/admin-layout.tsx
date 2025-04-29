"use client"

import type React from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { BarChart3, Users, Settings, LogOut, Mail, ShieldAlert, Database, Activity, User } from "lucide-react"
import { Logo } from "@/components/logo"
import { Skeleton } from "@/components/ui/skeleton"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { useAdminAuth } from "@/lib/admin/admin-auth-context"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

function AdminSidebarOld() {
  const { adminData, signOut } = useAdminAuth()
  const pathname = usePathname()

  const navigation = [
    {
      title: "Dashboard",
      href: "/admin/dashboard",
      icon: BarChart3,
      active: pathname === "/admin/dashboard",
    },
    {
      title: "Users",
      href: "/admin/users",
      icon: Users,
      active: pathname.startsWith("/admin/users"),
    },
    {
      title: "Recovery Emails",
      href: "/admin/recovery-emails",
      icon: Mail,
      active: pathname.startsWith("/admin/recovery-emails"),
    },
    {
      title: "Activity Logs",
      href: "/admin/activity",
      icon: Activity,
      active: pathname.startsWith("/admin/activity"),
    },
    {
      title: "Database",
      href: "/admin/database",
      icon: Database,
      active: pathname.startsWith("/admin/database"),
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: Settings,
      active: pathname.startsWith("/admin/settings"),
    },
  ]

  return (
    <Sidebar>
      <SidebarHeader className="flex h-14 items-center border-b px-4">
        <Logo className="h-6 w-auto" />
        <span className="ml-2 text-lg font-semibold">Admin</span>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={item.active}>
                    <a href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {adminData?.role === "master" && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Administration</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith("/admin/security")}>
                      <a href="/admin/security">
                        <ShieldAlert className="h-4 w-4" />
                        <span>Security</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="h-4 w-4 text-gray-600" />
            </div>
            <div className="ml-2">
              <p className="text-sm font-medium">{adminData?.name || "Admin"}</p>
              <p className="text-xs text-gray-500">{adminData?.role}</p>
            </div>
          </div>
          <button onClick={() => signOut()} className="rounded-md p-1 hover:bg-gray-100" title="Sign out">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { isLoading, user } = useAdminAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/admin/login")
    }
  }, [isLoading, user, router])

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="space-y-4 w-1/3">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="container mx-auto py-6 px-4">{children}</div>
    </div>
  )
}

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      {/* <div className="flex h-screen">
          <AdminSidebarOld />
          <AdminLayoutContent>{children}</AdminLayoutContent>
        </div> */}
      <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-muted/40 md:block">
          <AdminSidebar />
        </div>
        <div className="flex flex-col">
          <AdminHeader />
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
