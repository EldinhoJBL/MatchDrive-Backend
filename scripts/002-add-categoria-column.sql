-- Script para adicionar coluna categoria na tabela veiculos
-- Execute este script no SQL Editor do Supabase

-- Adicionar coluna categoria se nao existir
ALTER TABLE veiculos 
ADD COLUMN IF NOT EXISTS categoria VARCHAR(20) DEFAULT 'hatch' CHECK (categoria IN ('hatch', 'sedan', 'pickup'));

-- Criar indice para melhor performance nas buscas por categoria
CREATE INDEX IF NOT EXISTS idx_veiculos_categoria ON veiculos(categoria);

-- Atualizar veiculos existentes com categorias baseadas no modelo (exemplo)
UPDATE veiculos SET categoria = 'pickup' WHERE LOWER(modelo) LIKE '%strada%' OR LOWER(modelo) LIKE '%toro%' OR LOWER(modelo) LIKE '%hilux%' OR LOWER(modelo) LIKE '%s10%' OR LOWER(modelo) LIKE '%ranger%' OR LOWER(modelo) LIKE '%saveiro%';
UPDATE veiculos SET categoria = 'sedan' WHERE LOWER(modelo) LIKE '%corolla%' OR LOWER(modelo) LIKE '%civic%' OR LOWER(modelo) LIKE '%cruze%' OR LOWER(modelo) LIKE '%virtus%' OR LOWER(modelo) LIKE '%onix plus%' OR LOWER(modelo) LIKE '%hb20s%';
UPDATE veiculos SET categoria = 'hatch' WHERE categoria IS NULL OR categoria = 'hatch';

-- Inserir veiculos de exemplo com categoria (se a tabela estiver vazia)
INSERT INTO veiculos (marca, modelo, ano, preco, imagem_url, categoria) VALUES
  ('Fiat', 'Strada Freedom 1.3', 2024, 89900.00, 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800', 'pickup'),
  ('Volkswagen', 'Gol 1.0 MPI', 2023, 65900.00, 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800', 'hatch'),
  ('Chevrolet', 'Onix Plus LTZ', 2024, 95900.00, 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800', 'sedan'),
  ('Honda', 'City Sedan EXL', 2024, 129900.00, 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800', 'sedan'),
  ('Toyota', 'Corolla Cross XRE', 2024, 189900.00, 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800', 'sedan'),
  ('Hyundai', 'HB20 Sense 1.0', 2023, 72900.00, 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=800', 'hatch'),
  ('Renault', 'Kwid Zen 1.0', 2024, 59900.00, 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800', 'hatch'),
  ('Fiat', 'Toro Freedom 1.8', 2024, 149900.00, 'https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=800', 'pickup'),
  ('Toyota', 'Hilux SRV 2.8', 2024, 259900.00, 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800', 'pickup'),
  ('Volkswagen', 'Polo TSI', 2024, 89900.00, 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800', 'hatch')
ON CONFLICT DO NOTHING;
