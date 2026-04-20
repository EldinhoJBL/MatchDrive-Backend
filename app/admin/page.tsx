"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import AdminPanel from "@/components/admin-panel"
import { ArrowLeft, LogOut, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function AdminPage() {
  const { isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login")
    } else {
      setIsChecking(false)
    }
  }, [isAuthenticated, router])

  if (isChecking || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Verificando acesso...</p>
        </div>
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202026-04-17%20at%2017.17.47-lSzr4hIQfggQiWqsjR8bM0jfZyRKI5.jpeg"
                alt="Wyllkens Wcar Logo"
                width={140}
                height={50}
                className="h-10 w-auto object-contain"
              />
              <span className="text-xs text-muted-foreground border-l border-border pl-4">
                Painel Administrativo
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/")}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Recomendacao
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-red-400 border-red-400/30 hover:bg-red-500/10 hover:text-red-300"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Panel */}
      <main className="container mx-auto px-4 py-8">
        <AdminPanel />
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-red-500" />
            <span>Wyllkens Wcar - Consultoria Automotiva Premium em Castanhal, Para</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
