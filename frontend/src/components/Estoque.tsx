import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Veiculo } from '../lib/supabase';

type Props = {
  veiculos: Veiculo[];
  carregando: boolean;
  onRemovido: () => void;
};

export default function Estoque({ veiculos, carregando, onRemovido }: Props) {
  const [removendo, setRemovendo] = useState<string | null>(null);

  const handleRemover = async (id: string) => {
    setRemovendo(id);
    await supabase.from('veiculos').delete().eq('id', id);
    setRemovendo(null);
    onRemovido();
  };

  const formatarPreco = (preco: number) =>
    preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatarKm = (km: number) =>
    km.toLocaleString('pt-BR') + ' km';

  if (carregando) {
    return (
      <div className="estoque-loading">
        <div className="spinner" />
        <p>Carregando estoque...</p>
      </div>
    );
  }

  if (veiculos.length === 0) {
    return (
      <div className="estoque-vazio">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="1" y="3" width="15" height="13" rx="2" />
          <path d="m16 8 4 4-4 4" />
          <path d="M20 12H7" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
        <p>Nenhum veículo no estoque ainda.</p>
      </div>
    );
  }

  return (
    <div className="estoque-grid">
      {veiculos.map(v => (
        <div key={v.id} className="veiculo-card">
          <div className="veiculo-imagem-wrap">
            {v.imagem ? (
              <img src={v.imagem} alt={`${v.marca} ${v.modelo}`} className="veiculo-imagem" />
            ) : (
              <div className="veiculo-sem-imagem">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="m21 15-5-5L5 21" />
                </svg>
              </div>
            )}
          </div>
          <div className="veiculo-info">
            <h3 className="veiculo-nome">{v.marca} {v.modelo}</h3>
            <div className="veiculo-badges">
              <span className="badge">{v.ano}</span>
              <span className="badge">{v.cor}</span>
              {v.categoria && <span className="badge badge-categoria">{v.categoria.charAt(0).toUpperCase() + v.categoria.slice(1)}</span>}
              <span className="badge">{formatarKm(v.km)}</span>
            </div>
            {v.descricao && <p className="veiculo-descricao">{v.descricao}</p>}
            <div className="veiculo-footer">
              <span className="veiculo-preco">{formatarPreco(v.preco)}</span>
              <button
                className="btn-remover"
                onClick={() => handleRemover(v.id!)}
                disabled={removendo === v.id}
              >
                {removendo === v.id ? 'Removendo...' : 'Remover'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
