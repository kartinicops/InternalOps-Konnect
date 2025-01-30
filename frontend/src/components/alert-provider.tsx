"use client"

import { useEffect } from "react"
import { useAlert } from "@/hooks/useAlert"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

export function AlertProvider() {
  const { message, type, isVisible, hideAlert } = useAlert()

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        hideAlert()
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [isVisible, hideAlert])

  if (!isVisible) return null

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <Alert
        variant={type === "error" ? "destructive" : type === "success" ? "success" : "default"}
        onClose={hideAlert}
      >
        {message}
      </Alert>
    </div>
  )
}

