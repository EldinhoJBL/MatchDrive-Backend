import React, { useState } from 'react';
import { supabase } from '../lib/supabase'; // Verifique se o caminho está correto

export default function CadastroForm() {
  const [modelo, setModelo] = useState('');
  const [preco, setPreco] = useState('');
  const [categoria, setCategoria] = useState('Hatch');
  const [file, setFile] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Por favor, selecione uma foto!");
    
    setEnviando(true);

    try {
      // 1. Gerar nome único para a imagem
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // 2. Upload para o Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('fotos-veiculos') // Nome do seu bucket
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // 3. Pegar a URL pública da imagem
      const { data: urlData } = supabase.storage
        .from('fotos-veiculos')
        .getPublicUrl(fileName);

      const imageUrl = urlData.publicUrl;

      // 4. Salvar no Banco de Dados (Tabela veiculos)
      const { error: dbError } = await supabase
        .from('veiculos')
        .insert([{ 
          modelo, 
          preco: parseFloat(preco), 
          categoria, 
          imagem: imageUrl 
        }]);

      if (dbError) throw dbError;

      alert("Wyllkens Wcar: Veículo cadastrado com sucesso!");
      setModelo('');
      setPreco('');
      setFile(null);
      
    } catch (error: any) {
      alert("Erro no processo: " + error.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-gray-900 rounded-lg border border-gray-800">
      <h2 className="text-xl font-bold text-white mb-4">Cadastrar no Wyllkens Wcar</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-400">Modelo do Veículo</label>
        <input 
          type="text" 
          value={modelo} 
          onChange={(e) => setModelo(e.target.value)}
          className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white" 
          required 
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400">Preço (R$)</label>
        <input 
          type="number" 
          value={preco} 
          onChange={(e) => setPreco(e.target.value)}
          className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white" 
          required 
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400">Categoria</label>
        <select 
          value={categoria} 
          onChange={(e) => setCategoria(e.target.value)}
          className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
        >
          <option value="Hatch">Hatch</option>
          <option value="Sedan">Sedan</option>
          <option value="Pickup">Pickup</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400">Foto (Direto do Celular)</label>
        <input 
          type="file" 
          accept="image/*" 
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white file:bg-blue-600 file:text-white file:border-0 file:rounded file:px-2 file:mr-2"
          required
        />
      </div>

      <button 
        type="submit" 
        disabled={enviando}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded transition-all"
      >
        {enviando ? 'Enviando Foto e Dados...' : 'Salvar Veículo'}
      </button>
    </form>
  );
}
