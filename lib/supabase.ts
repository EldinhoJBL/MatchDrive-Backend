import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zbrgyhorekdqwpmyndpt.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpicmd5aG9yZWtkcXdwbXluZHB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0NDcwMDEsImV4cCI6MjA5MjAyMzAwMX0.afdTCxaLE6ZPhWJNCAQL0Cg1cr4IcOmmLyZylQwsGLE'

export const supabase = createClient(supabaseUrl, supabaseKey)

export type CategoriaVeiculo = 'hatch' | 'sedan' | 'pickup'

export interface Veiculo {
  id?: number
  marca: string
  modelo: string
  ano: number
  preco: number
  categoria: CategoriaVeiculo
  imagem?: string
  imagens?: string[]
  imagem_url?: string
  created_at?: string
}
