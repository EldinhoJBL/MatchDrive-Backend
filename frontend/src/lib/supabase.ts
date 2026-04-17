import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Veiculo = {
  id?: string;
  marca: string;
  modelo: string;
  ano: number;
  preco: number;
  km: number;
  cor: string;
  descricao: string;
  imagem: string;
  created_at?: string;
};
