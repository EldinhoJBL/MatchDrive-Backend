import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { Veiculo } from '../lib/supabase';

type Props = {
  onVeiculoAdicionado: () => void;
};

const camposVazios = {
  marca: '',
  modelo: '',
  ano: new Date().getFullYear(),
  preco: 0,
  km: 0,
  cor: '',
  descricao: '',
  imagem: '',
};

export default function CadastroForm({ onVeiculoAdicionado }: Props) {
  const [form, setForm] = useState(camposVazios);
  const [uploadando, setUploadando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const inputArquivoRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'ano' || name === 'preco' || name === 'km' ? Number(value) : value }));
  };

  const handleArquivoSelecionado = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    if (!arquivo.type.startsWith('image/')) {
      setErro('Por favor, selecione um arquivo de imagem válido.');
      return;
    }

    setErro('');
    setPreviewUrl(URL.createObjectURL(arquivo));
    setUploadando(true);

    const extensao = arquivo.name.split('.').pop();
    const nomeArquivo = `veiculo_${Date.now()}.${extensao}`;

    const { data, error } = await supabase.storage
      .from('fotos-veiculos')
      .upload(nomeArquivo, arquivo, { upsert: true });

    if (error) {
      setErro('Erro ao fazer upload da imagem: ' + error.message);
      setUploadando(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('fotos-veiculos')
      .getPublicUrl(data.path);

    setForm(prev => ({ ...prev, imagem: urlData.publicUrl }));
    setUploadando(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadando) return;

    setSalvando(true);
    setErro('');

    const veiculo: Veiculo = { ...form };

    const { error } = await supabase.from('veiculos').insert([veiculo]);

    if (error) {
      setErro('Erro ao salvar veículo: ' + error.message);
    } else {
      setForm(camposVazios);
      setPreviewUrl('');
      if (inputArquivoRef.current) inputArquivoRef.current.value = '';
      onVeiculoAdicionado();
    }

    setSalvando(false);
  };

  return (
    <div className="cadastro-card">
      <h2 className="form-title">Cadastrar Veículo</h2>
      <form onSubmit={handleSubmit} className="cadastro-form">
        <div className="form-row">
          <div className="form-group">
            <label>Marca</label>
            <input name="marca" value={form.marca} onChange={handleChange} placeholder="Ex: Toyota" required />
          </div>
          <div className="form-group">
            <label>Modelo</label>
            <input name="modelo" value={form.modelo} onChange={handleChange} placeholder="Ex: Corolla" required />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Ano</label>
            <input name="ano" type="number" value={form.ano} onChange={handleChange} min="1990" max="2030" required />
          </div>
          <div className="form-group">
            <label>Preço (R$)</label>
            <input name="preco" type="number" value={form.preco} onChange={handleChange} min="0" step="0.01" required />
          </div>
          <div className="form-group">
            <label>KM</label>
            <input name="km" type="number" value={form.km} onChange={handleChange} min="0" required />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Cor</label>
            <input name="cor" value={form.cor} onChange={handleChange} placeholder="Ex: Prata" required />
          </div>
        </div>

        <div className="form-group">
          <label>Descrição</label>
          <textarea name="descricao" value={form.descricao} onChange={handleChange} placeholder="Detalhes do veículo..." rows={3} />
        </div>

        <div className="form-group">
          <label>Foto do Veículo</label>
          <div className="upload-area">
            <input
              ref={inputArquivoRef}
              type="file"
              accept="image/*"
              onChange={handleArquivoSelecionado}
              className="input-arquivo"
              id="input-foto"
            />
            <label htmlFor="input-foto" className={`upload-label ${uploadando ? 'uploading' : ''}`}>
              {uploadando ? (
                <span className="upload-status">
                  <span className="spinner-small" />
                  Enviando imagem...
                </span>
              ) : (
                <span className="upload-status">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  {previewUrl ? 'Trocar imagem' : 'Selecionar imagem'}
                </span>
              )}
            </label>
            {previewUrl && (
              <div className="preview-container">
                <img src={previewUrl} alt="Preview" className="imagem-preview" />
                {form.imagem && <span className="upload-ok">Imagem salva com sucesso</span>}
              </div>
            )}
          </div>
        </div>

        {erro && <div className="erro-msg">{erro}</div>}

        <button
          type="submit"
          className="btn-salvar"
          disabled={salvando || uploadando}
        >
          {salvando ? (
            <span className="btn-loading">
              <span className="spinner-small" />
              Salvando...
            </span>
          ) : uploadando ? (
            <span className="btn-loading">
              <span className="spinner-small" />
              Carregando...
            </span>
          ) : (
            'Salvar Veículo'
          )}
        </button>
      </form>
    </div>
  );
}
