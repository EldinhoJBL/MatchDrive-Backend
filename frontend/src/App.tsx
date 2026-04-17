import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import type { Veiculo } from './lib/supabase';
import CadastroForm from './components/CadastroForm';
import Estoque from './components/Estoque';
import LoginForm from './components/LoginForm';
import ClienteMatch from './components/ClienteMatch';
import './App.css';

type Aba = 'match' | 'estoque' | 'cadastro';

export default function App() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [aba, setAba] = useState<Aba>('match');
  const [adminLogado, setAdminLogado] = useState(false);
  const [mostrarLogin, setMostrarLogin] = useState(false);

  const carregarVeiculos = async () => {
    setCarregando(true);
    const { data } = await supabase.from('veiculos').select('*').order('created_at', { ascending: false });
    setVeiculos(data ?? []);
    setCarregando(false);
  };

  useEffect(() => {
    carregarVeiculos();
    // Verificar se já está logado
    const logado = localStorage.getItem('wyllkens_admin_logado') === 'true';
    setAdminLogado(logado);
  }, []);

  const handleVeiculoAdicionado = () => {
    carregarVeiculos();
    setAba('estoque');
  };

  const handleLoginSuccess = () => {
    setAdminLogado(true);
    setMostrarLogin(false);
    setAba('estoque');
  };

  const handleLogout = () => {
    localStorage.removeItem('wyllkens_admin_logado');
    setAdminLogado(false);
    setAba('match');
  };

  const handleAcessarAdmin = () => {
    if (adminLogado) {
      setAba('estoque');
    } else {
      setMostrarLogin(true);
    }
  };

  // Tela de login
  if (mostrarLogin && !adminLogado) {
    return (
      <div className="app">
        <header className="header">
          <div className="header-inner">
            <div className="logo" onClick={() => setMostrarLogin(false)} style={{ cursor: 'pointer' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="3" width="15" height="13" rx="2" />
                <path d="m16 8 4 4-4 4" />
                <path d="M20 12H7" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
              <span>Wyllkens Wcar</span>
            </div>
            <button className="nav-btn" onClick={() => setMostrarLogin(false)}>
              Voltar
            </button>
          </div>
        </header>
        <main className="main">
          <LoginForm onLoginSuccess={handleLoginSuccess} />
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo" onClick={() => setAba('match')} style={{ cursor: 'pointer' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="3" width="15" height="13" rx="2" />
              <path d="m16 8 4 4-4 4" />
              <path d="M20 12H7" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
            <span>Wyllkens Wcar</span>
          </div>
          <nav className="nav">
            <button
              className={`nav-btn ${aba === 'match' ? 'active' : ''}`}
              onClick={() => setAba('match')}
            >
              Encontrar Carro
            </button>

            {adminLogado ? (
              <>
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
                <button className="nav-btn logout" onClick={handleLogout}>
                  Sair
                </button>
              </>
            ) : (
              <button className="nav-btn" onClick={handleAcessarAdmin}>
                Admin
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="main">
        {aba === 'match' && (
          <div className="section">
            <div className="section-header">
              <h1>Bem-vindo a Wyllkens Wcar</h1>
              <p className="section-sub">Encontre o carro perfeito para você em Castanhal</p>
            </div>
            <ClienteMatch veiculos={veiculos} />
          </div>
        )}

        {aba === 'estoque' && adminLogado && (
          <div className="section">
            <div className="section-header">
              <h1>Estoque de Veículos</h1>
              <p className="section-sub">{veiculos.length} {veiculos.length === 1 ? 'veículo disponível' : 'veículos disponíveis'}</p>
            </div>
            <Estoque veiculos={veiculos} carregando={carregando} onRemovido={carregarVeiculos} />
          </div>
        )}

        {aba === 'cadastro' && adminLogado && (
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
