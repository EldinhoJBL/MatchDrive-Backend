import { useState } from 'react';

type Props = {
  onLoginSuccess: () => void;
};

export default function LoginForm({ onLoginSuccess }: Props) {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    setErro('');

    // Credenciais fixas conforme solicitado
    if (usuario === 'admin' && senha === 'administrador123') {
      localStorage.setItem('wyllkens_admin_logado', 'true');
      onLoginSuccess();
    } else {
      setErro('Usuário ou senha incorretos.');
    }

    setCarregando(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1" y="3" width="15" height="13" rx="2" />
            <path d="m16 8 4 4-4 4" />
            <path d="M20 12H7" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
          <h1>Wyllkens Wcar</h1>
          <p>Acesso administrativo</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Usuário</label>
            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="Digite seu usuário"
              required
            />
          </div>

          <div className="form-group">
            <label>Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Digite sua senha"
              required
            />
          </div>

          {erro && <div className="erro-msg">{erro}</div>}

          <button type="submit" className="btn-login" disabled={carregando}>
            {carregando ? (
              <span className="btn-loading">
                <span className="spinner-small" />
                Entrando...
              </span>
            ) : (
              'Entrar'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
