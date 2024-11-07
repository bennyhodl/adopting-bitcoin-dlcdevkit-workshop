'use client'

import { Link, useLocation } from "react-router-dom"
import { BoxIcon, ChevronRight } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// This is sample navigation data
const navigation = {
  gettingStarted: {
    label: "Getting Started",
    items: [
      { title: "About", href: "/about" },
      { title: "Project Structure", href: "/users" },
    ],
  },
  buildingApp: {
    label: "Building Your Application",
    items: [
      { title: "Routing", href: "/routing" },
    ],
  },
  apiReference: {
    label: "API Reference",
    items: [
      { title: "Components", href: "/components" },
      { title: "File Conventions", href: "/file-conventions" },
    ],
  },
}

export default function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar className="dark border-r">
      <SidebarHeader className="flex items-center justify-between px-4 py-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/" className="flex items-center gap-2">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <BoxIcon className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Documentation</span>
                  <span className="text-xs">v1.0.1</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {Object.entries(navigation).map(([key, section]) => (
          <SidebarGroup key={key}>
            <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.href}
                    >
                      <Link to={item.href} className="flex items-center justify-between">
                        {item.title}
                        {location.pathname === item.href && (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  )
}