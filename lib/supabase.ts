import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

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
