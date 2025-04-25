import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Home, Settings } from "lucide-react"

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string
    title: string
    icon: React.ComponentType<{ className?: string }>
  }[]
  currentPath: string
}

export function DashboardSidebar({ className, items, currentPath, ...props }: SidebarNavProps) {
  return (
    <nav className={cn("flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1", className)} {...props}>
      {items.map((item) => (
        <Button
          key={item.href}
          variant={currentPath === item.href ? "default" : "ghost"}
          className={cn(
            "justify-start",
            currentPath === item.href
              ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
              : "hover:bg-muted text-foreground",
          )}
          asChild
        >
          <Link href={item.href}>
            <item.icon className="mr-2 h-4 w-4" />
            {item.title}
          </Link>
        </Button>
      ))}
    </nav>
  )
}

export function DashboardNav({ currentPath }: { currentPath: string }) {
  const items = [
    {
      title: "Visão Geral",
      href: "/dashboard",
      icon: Home,
    },
    {
      title: "Configurações",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ]

  return <DashboardSidebar items={items} currentPath={currentPath} />
}
