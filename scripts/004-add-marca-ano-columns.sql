-- Script para adicionar colunas marca e ano na tabela veiculos
-- Executado em: 2026-04-20

-- Adicionar coluna marca
ALTER TABLE veiculos ADD COLUMN IF NOT EXISTS marca TEXT NOT NULL DEFAULT '';

-- Adicionar coluna ano
ALTER TABLE veiculos ADD COLUMN IF NOT EXISTS ano INTEGER NOT NULL DEFAULT 2024;

-- Comentarios nas colunas
COMMENT ON COLUMN veiculos.marca IS 'Marca do veiculo (ex: Toyota, Honda, Ford)';
COMMENT ON COLUMN veiculos.ano IS 'Ano de fabricacao do veiculo';
