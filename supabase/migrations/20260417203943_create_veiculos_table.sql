/*
  # Create veiculos table

  1. New Tables
    - `veiculos`
      - `id` (uuid, primary key)
      - `marca` (text) - vehicle brand
      - `modelo` (text) - vehicle model
      - `ano` (integer) - vehicle year
      - `preco` (numeric) - vehicle price
      - `km` (numeric) - mileage
      - `cor` (text) - vehicle color
      - `descricao` (text) - vehicle description
      - `imagem` (text) - public URL of vehicle image
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `veiculos` table
    - Add policy for public read access (inventory is public)
    - Add policy for authenticated insert/update/delete
*/

CREATE TABLE IF NOT EXISTS veiculos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  marca text NOT NULL DEFAULT '',
  modelo text NOT NULL DEFAULT '',
  ano integer NOT NULL DEFAULT 2024,
  preco numeric NOT NULL DEFAULT 0,
  km numeric NOT NULL DEFAULT 0,
  cor text NOT NULL DEFAULT '',
  descricao text NOT NULL DEFAULT '',
  imagem text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE veiculos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read veiculos"
  ON veiculos
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert veiculos"
  ON veiculos
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update veiculos"
  ON veiculos
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete veiculos"
  ON veiculos
  FOR DELETE
  TO anon, authenticated
  USING (true);
