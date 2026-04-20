-- Script para ajustar a tabela veiculos
-- Colunas finais: modelo (text), preco (decimal), categoria (text), imagem (text)

-- Adicionar coluna imagem se nao existir
ALTER TABLE veiculos ADD COLUMN IF NOT EXISTS imagem TEXT;

-- Copiar dados de imagem_url para imagem (se imagem_url existir)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'veiculos' AND column_name = 'imagem_url'
  ) THEN
    UPDATE veiculos SET imagem = imagem_url WHERE imagem IS NULL AND imagem_url IS NOT NULL;
  END IF;
END $$;

-- Garantir que preco e do tipo correto (decimal/numeric)
-- Se precisar alterar o tipo da coluna preco
DO $$
BEGIN
  -- Verificar se preco existe e alterar para numeric se necessario
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'veiculos' AND column_name = 'preco'
  ) THEN
    ALTER TABLE veiculos ALTER COLUMN preco TYPE DECIMAL(12,2);
  ELSE
    ALTER TABLE veiculos ADD COLUMN preco DECIMAL(12,2);
  END IF;
EXCEPTION
  WHEN others THEN
    -- Ignora erro se ja estiver no tipo correto
    RAISE NOTICE 'Coluna preco ja esta no tipo correto ou ocorreu um erro: %', SQLERRM;
END $$;

-- Garantir que categoria existe e tem os valores corretos
-- A coluna categoria deve aceitar: 'hatch', 'sedan', 'pickup'
ALTER TABLE veiculos ADD COLUMN IF NOT EXISTS categoria TEXT DEFAULT 'hatch';

-- Adicionar constraint para valores validos de categoria (se nao existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'veiculos_categoria_check'
  ) THEN
    ALTER TABLE veiculos ADD CONSTRAINT veiculos_categoria_check 
    CHECK (categoria IN ('hatch', 'sedan', 'pickup'));
  END IF;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Constraint ja existe ou erro: %', SQLERRM;
END $$;

-- Garantir que modelo existe
ALTER TABLE veiculos ADD COLUMN IF NOT EXISTS modelo TEXT;

-- Definir modelo como NOT NULL se possivel (apenas se todos os registros tiverem modelo)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM veiculos WHERE modelo IS NULL) THEN
    ALTER TABLE veiculos ALTER COLUMN modelo SET NOT NULL;
  END IF;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Nao foi possivel definir modelo como NOT NULL: %', SQLERRM;
END $$;
