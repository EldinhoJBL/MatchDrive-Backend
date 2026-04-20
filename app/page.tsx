'use client'

import { ConsultoriaDashboard } from '@/components/consultoria-dashboard'
import { MapPin, Lock, Phone } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202026-04-17%20at%2017.17.47-lSzr4hIQfggQiWqsjR8bM0jfZyRKI5.jpeg"
                alt="Wyllkens Wcar Logo"
                width={180}
                height={60}
                className="h-14 w-auto object-contain"
                priority
              />
            </div>
            <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-red-500" />
                <span>(91) 98723-8874</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-red-500" />
                <span>Castanhal, PA</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-1">
        <ConsultoriaDashboard />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/80">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <span className="font-semibold text-foreground">
                Wyllkens Wcar
              </span>
              <span className="hidden md:inline text-border">|</span>
              <span>Compra - Venda - Troca - Financia</span>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-red-500" />
                <span>Rua Primeiro de Maio, 1253 - Pirapora, Castanhal-PA</span>
              </div>
              <Link 
                href="/admin" 
                className="flex items-center gap-1 text-muted-foreground/60 hover:text-red-500 transition-colors"
              >
                <Lock className="h-3 w-3" />
                <span className="text-xs">Area do Lojista</span>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
