"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"
import { useUiStore, selectTheme } from "@/stores/uiStore"

const Toaster = ({ ...props }: ToasterProps) => {
  // The dashboard's light/dark mode is driven by useUiStore (persisted to
  // localStorage, toggles the `.dark` class on <html> — see setTheme in
  // stores/uiStore.ts), not by next-themes. next-themes is not mounted
  // anywhere in this app, so reading it here would silently fall back to
  // "system" and ignore whatever the user actually picked in the app.
  // Reading the real store keeps toast styling in sync with the rest of
  // the UI in every case, including when the OS preference and the user's
  // in-app choice differ.
  const theme = useUiStore(selectTheme)

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
