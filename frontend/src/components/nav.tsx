"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { cn } from "@/lib/page"
import { Button } from "@/components/ui/button"
import { LogIn, UserCircle, Menu } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface NavProps {
  isProjectDetail?: boolean
  projectName?: string
}

export function Nav({ isProjectDetail = false, projectName }: NavProps) {
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    setIsLoggedIn(!!token)
  }, [])

  const showProfileButton = pathname !== "/login"

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-blue-200 bg-blue-50">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-8">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-blue-600"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
            <span className="hidden font-bold text-blue-800 sm:inline-block">
              {isProjectDetail ? projectName || "Project Name" : "Konnect"}
            </span>
          </Link>

          {!isProjectDetail && (
            <div className="hidden md:flex md:items-center md:space-x-4">
              <Button
                asChild
                variant="link"
                className={cn(
                  "text-blue-600 hover:text-blue-800",
                  pathname === "/projects" && "font-semibold text-blue-800",
                )}
              >
                <Link href="/projects">Projects</Link>
              </Button>
              <Button
                asChild
                variant="link"
                className={cn(
                  "text-blue-600 hover:text-blue-800",
                  pathname === "/experts" && "font-semibold text-blue-800",
                )}
              >
                <Link href="/experts">Experts</Link>
              </Button>
              <Button
                asChild
                variant="link"
                className={cn(
                  "text-blue-600 hover:text-blue-800",
                  pathname === "/experts" && "font-semibold text-blue-800",
                )}
              >
                <Link href="/send-email">Send Email</Link>
              </Button>
            </div>
          )}
        </div>
        

        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-blue-300 text-blue-700 hover:bg-blue-100 hover:text-blue-800 md:hidden"
              >
                <Menu className="h-4 w-4" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-blue-50">
              {!isProjectDetail && (
                <>
                  <DropdownMenuItem asChild className="text-blue-700 hover:bg-blue-100 hover:text-blue-800">
                    <Link href="/projects">Projects</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="text-blue-700 hover:bg-blue-100 hover:text-blue-800">
                    <Link href="/experts">Experts</Link>
                  </DropdownMenuItem>
                  {showProfileButton ? (
                    <DropdownMenuItem asChild className="text-blue-700 hover:bg-blue-100 hover:text-blue-800">
                      <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem asChild className="text-blue-700 hover:bg-blue-100 hover:text-blue-800">
                      <Link href="/login">Login</Link>
                    </DropdownMenuItem>
                  )}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="hidden items-center space-x-4 sm:flex">
            {showProfileButton ? (
              <Button
                asChild
                variant="outline"
                size="icon"
                className="rounded-full border-blue-300 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
              >
                <Link href="/profile">
                  <UserCircle className="h-5 w-5" />
                  <span className="sr-only">Profile</span>
                </Link>
              </Button>
            ) : (
              <Button
                asChild
                variant="outline"
                size="icon"
                className="rounded-full border-blue-300 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
              >
                <Link href="/login">
                  <LogIn className="h-5 w-5" />
                  <span className="sr-only">Login</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
