-- Script para criar a tabela de veículos no Supabase
-- Execute este script no SQL Editor do Supabase se a tabela ainda não existir

CREATE TABLE IF NOT EXISTS veiculos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  marca VARCHAR(100) NOT NULL,
  modelo VARCHAR(100) NOT NULL,
  ano INTEGER NOT NULL,
  preco DECIMAL(12, 2) NOT NULL,
  imagem_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_veiculos_preco ON veiculos(preco);
CREATE INDEX IF NOT EXISTS idx_veiculos_ano ON veiculos(ano);
CREATE INDEX IF NOT EXISTS idx_veiculos_marca ON veiculos(marca);

-- Habilitar RLS (Row Level Security)
ALTER TABLE veiculos ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública
CREATE POLICY "Permitir leitura publica de veiculos" ON veiculos
  FOR SELECT USING (true);

-- Política para permitir inserção (ajuste conforme necessidade de autenticação)
CREATE POLICY "Permitir insercao de veiculos" ON veiculos
  FOR INSERT WITH CHECK (true);

-- Política para permitir atualização
CREATE POLICY "Permitir atualizacao de veiculos" ON veiculos
  FOR UPDATE USING (true);

-- Política para permitir exclusão
CREATE POLICY "Permitir exclusao de veiculos" ON veiculos
  FOR DELETE USING (true);

-- Inserir alguns veículos de exemplo para a região de Castanhal
INSERT INTO veiculos (marca, modelo, ano, preco, imagem_url) VALUES
  ('Fiat', 'Strada Freedom 1.3', 2024, 89900.00, 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800'),
  ('Volkswagen', 'Gol 1.0 MPI', 2023, 65900.00, 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800'),
  ('Chevrolet', 'Onix Plus LTZ', 2024, 95900.00, 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800'),
  ('Honda', 'HR-V EXL', 2024, 159900.00, 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800'),
  ('Toyota', 'Corolla Cross XRE', 2024, 189900.00, 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800'),
  ('Hyundai', 'HB20 Sense 1.0', 2023, 72900.00, 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=800'),
  ('Renault', 'Kwid Zen 1.0', 2024, 59900.00, 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800'),
  ('Jeep', 'Renegade Sport', 2024, 129900.00, 'https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=800')
ON CONFLICT DO NOTHING;
