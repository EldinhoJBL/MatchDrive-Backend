import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import type { Veiculo } from './lib/supabase';
import CadastroForm from './components/CadastroForm';
import Estoque from './components/Estoque';
import './App.css';

export default function App() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [aba, setAba] = useState<'estoque' | 'cadastro'>('estoque');

  const carregarVeiculos = async () => {
    setCarregando(true);
    const { data } = await supabase.from('veiculos').select('*').order('created_at', { ascending: false });
    setVeiculos(data ?? []);
    setCarregando(false);
  };

  useEffect(() => {
    carregarVeiculos();
  }, []);

  const handleVeiculoAdicionado = () => {
    carregarVeiculos();
    setAba('estoque');
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="3" width="15" height="13" rx="2" />
              <path d="m16 8 4 4-4 4" />
              <path d="M20 12H7" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
            <span>AutoGestão</span>
          </div>
          <nav className="nav">
            <button
              className={`nav-btn ${aba === 'estoque' ? 'active' : ''}`}
              onClick={() => setAba('estoque')}
            >
              Estoque
              <span className="badge-count">{veiculos.length}</span>
            </button>
            <button
              className={`nav-btn ${aba === 'cadastro' ? 'active' : ''}`}
              onClick={() => setAba('cadastro')}
            >
              + Cadastrar
            </button>
          </nav>
        </div>
      </header>

      <main className="main">
        {aba === 'estoque' ? (
          <div className="section">
            <div className="section-header">
              <h1>Estoque de Veículos</h1>
              <p className="section-sub">{veiculos.length} {veiculos.length === 1 ? 'veículo disponível' : 'veículos disponíveis'}</p>
            </div>
            <Estoque veiculos={veiculos} carregando={carregando} onRemovido={carregarVeiculos} />
          </div>
        ) : (
          <div className="section">
            <div className="section-header">
              <h1>Cadastrar Veículo</h1>
              <p className="section-sub">Preencha os dados e adicione uma foto do veículo</p>
            </div>
            <CadastroForm onVeiculoAdicionado={handleVeiculoAdicionado} />
          </div>
        )}
      </main>
    </div>
  );
}
