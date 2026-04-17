import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Veiculo } from '../lib/supabase';

type Props = {
  veiculos: Veiculo[];
};

type PerfilCliente = {
  nome: string;
  idade: string;
  profissao: string;
  tipoPreferido: 'hatch' | 'sedan' | 'pickup' | '';
  renda: string;
};

export default function ClienteMatch({ veiculos }: Props) {
  const [perfil, setPerfil] = useState<PerfilCliente>({
    nome: '',
    idade: '',
    profissao: '',
    tipoPreferido: '',
    renda: '',
  });
  const [recomendacoes, setRecomendacoes] = useState<Veiculo[]>([]);
  const [explicacao, setExplicacao] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [erro, setErro] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPerfil(prev => ({ ...prev, [name]: value }));
  };

  const buscarRecomendacao = async (e: React.FormEvent) => {
    e.preventDefault();
    setBuscando(true);
    setErro('');
    setRecomendacoes([]);
    setExplicacao('');

    if (veiculos.length === 0) {
      setErro('Não há veículos disponíveis no momento.');
      setBuscando(false);
      return;
    }

    try {
      const veiculosTexto = veiculos.map(v => 
        `ID: ${v.id}, ${v.marca} ${v.modelo} ${v.ano}, Cor: ${v.cor}, KM: ${v.km}, Preço: R$ ${v.preco.toLocaleString('pt-BR')}, Descrição: ${v.descricao || 'N/A'}`
      ).join('\n');

      const prompt = `Você é um consultor de vendas de carros da loja Wyllkens Wcar em Castanhal, Pará.

PERFIL DO CLIENTE:
- Nome: ${perfil.nome}
- Idade: ${perfil.idade} anos
- Profissão: ${perfil.profissao}
- Tipo de carro preferido: ${perfil.tipoPreferido || 'Não especificado'}
- Renda mensal aproximada: R$ ${perfil.renda}

VEÍCULOS DISPONÍVEIS:
${veiculosTexto}

INSTRUÇÕES IMPORTANTES:
1. PRIORIZE o Tipo de Carro preferido pelo cliente (Hatch, Sedan ou Pickup). Se o cliente escolheu um tipo, dê forte preferência a veículos desse tipo.
2. CONSIDERE o perfil do cliente (idade e profissão) para entender suas necessidades de uso.
3. A renda é apenas um dado COMPLEMENTAR - não é o fator principal. Use apenas para verificar se o veículo está dentro da realidade financeira do cliente.
4. Seja amigável e pessoal, usando o nome do cliente.

Responda em formato JSON com a estrutura:
{
  "veiculosRecomendados": ["id1", "id2"],
  "explicacao": "Explicação personalizada de 2-3 frases sobre por que esses veículos são ideais para o cliente, mencionando o tipo preferido e o perfil."
}

Recomende no máximo 3 veículos, priorizando sempre o tipo de carro preferido e o perfil do cliente.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1024,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao consultar a IA');
      }

      const data = await response.json();
      const textoResposta = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Extrair JSON da resposta
      const jsonMatch = textoResposta.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const resultado = JSON.parse(jsonMatch[0]);
        const idsRecomendados = resultado.veiculosRecomendados || [];
        const veiculosFiltrados = veiculos.filter(v => idsRecomendados.includes(v.id));
        
        setRecomendacoes(veiculosFiltrados);
        setExplicacao(resultado.explicacao || 'Veículos selecionados com base no seu perfil.');
      } else {
        throw new Error('Resposta inválida da IA');
      }
    } catch (err) {
      console.error(err);
      setErro('Não foi possível obter recomendações. Tente novamente.');
    }

    setBuscando(false);
  };

  const formatarPreco = (preco: number) =>
    preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatarKm = (km: number) =>
    km.toLocaleString('pt-BR') + ' km';

  return (
    <div className="cliente-match">
      <div className="match-intro">
        <h2>Encontre seu carro ideal</h2>
        <p>Preencha seus dados e nossa IA vai recomendar os melhores veículos para você!</p>
      </div>

      <form onSubmit={buscarRecomendacao} className="match-form">
        <div className="form-row">
          <div className="form-group">
            <label>Seu Nome</label>
            <input
              name="nome"
              value={perfil.nome}
              onChange={handleChange}
              placeholder="Ex: João Silva"
              required
            />
          </div>
          <div className="form-group">
            <label>Idade</label>
            <input
              name="idade"
              type="number"
              value={perfil.idade}
              onChange={handleChange}
              placeholder="Ex: 35"
              min="18"
              max="100"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Profissão</label>
            <input
              name="profissao"
              value={perfil.profissao}
              onChange={handleChange}
              placeholder="Ex: Médico, Professor, Empresário"
              required
            />
          </div>
          <div className="form-group">
            <label>Renda Mensal (R$)</label>
            <input
              name="renda"
              type="number"
              value={perfil.renda}
              onChange={handleChange}
              placeholder="Ex: 5000"
              min="0"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Tipo de Carro Preferido</label>
          <select name="tipoPreferido" value={perfil.tipoPreferido} onChange={handleChange} required>
            <option value="">Selecione o tipo</option>
            <option value="hatch">Hatch (compacto, econômico)</option>
            <option value="sedan">Sedan (conforto, espaço)</option>
            <option value="pickup">Pickup (trabalho, aventura)</option>
          </select>
        </div>

        {erro && <div className="erro-msg">{erro}</div>}

        <button type="submit" className="btn-match" disabled={buscando}>
          {buscando ? (
            <span className="btn-loading">
              <span className="spinner-small" />
              Analisando seu perfil...
            </span>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="m2 17 10 5 10-5" />
                <path d="m2 12 10 5 10-5" />
              </svg>
              Encontrar meu carro
            </>
          )}
        </button>
      </form>

      {recomendacoes.length > 0 && (
        <div className="recomendacoes">
          <div className="recomendacoes-header">
            <h3>Veículos recomendados para você</h3>
            <p className="explicacao-ia">{explicacao}</p>
          </div>

          <div className="recomendacoes-grid">
            {recomendacoes.map(v => (
              <div key={v.id} className="veiculo-card recomendado">
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
                  <span className="badge-recomendado">Recomendado</span>
                </div>
                <div className="veiculo-info">
                  <h3 className="veiculo-nome">{v.marca} {v.modelo}</h3>
                  <div className="veiculo-badges">
                    <span className="badge">{v.ano}</span>
                    <span className="badge">{v.cor}</span>
                    <span className="badge">{formatarKm(v.km)}</span>
                  </div>
                  {v.descricao && <p className="veiculo-descricao">{v.descricao}</p>}
                  <div className="veiculo-footer">
                    <span className="veiculo-preco">{formatarPreco(v.preco)}</span>
                    <a
                      href={`https://wa.me/5591999999999?text=Olá! Vi o ${v.marca} ${v.modelo} no site e tenho interesse!`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-contato"
                    >
                      Tenho interesse
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
