"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { ArrowLeft, Eye, EyeOff, Lock, User, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login, isAuthenticated } = useAuth()
  const router = useRouter()

  // Se ja estiver autenticado, redireciona para admin
  if (isAuthenticated) {
    router.replace("/admin")
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Simula delay de autenticacao
    await new Promise(resolve => setTimeout(resolve, 500))

    const success = login(username, password)
    
    if (success) {
      router.push("/admin")
    } else {
      setError("Usuario ou senha incorretos")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header simplificado */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202026-04-17%20at%2017.17.47-lSzr4hIQfggQiWqsjR8bM0jfZyRKI5.jpeg"
              alt="Wyllkens Wcar Logo"
              width={140}
              height={50}
              className="h-10 w-auto object-contain"
            />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Recomendacao
            </Button>
          </div>
        </div>
      </header>

      {/* Login Form */}
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto p-4 rounded-full bg-red-500/10 w-fit">
              <ShieldCheck className="h-10 w-10 text-red-500" />
            </div>
            <div>
              <CardTitle className="text-2xl">Area do Lojista</CardTitle>
              <CardDescription className="mt-2">
                Acesso restrito para gerenciamento do estoque Wyllkens Wcar
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Usuario
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Digite seu usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 bg-background/50 border-border/50 focus:border-red-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-background/50 border-border/50 focus:border-red-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Entrando...
                  </div>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-border/50">
              <p className="text-xs text-center text-muted-foreground">
                Acesso exclusivo para funcionarios autorizados da Wyllkens Wcar - Consultoria Automotiva Premium em Castanhal
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
