import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
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

type MatchResult = {
  veiculo: Veiculo;
  explicacao: string;
};

export default function ClienteMatch({ veiculos }: Props) {
  const [perfil, setPerfil] = useState<PerfilCliente>({
    nome: '',
    idade: '',
    profissao: '',
    tipoPreferido: '',
    renda: '',
  });
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [erro, setErro] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPerfil(prev => ({ ...prev, [name]: value }));
  };

  const buscarMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setBuscando(true);
    setErro('');
    setMatches([]);

    if (veiculos.length === 0) {
      setErro('Não há veículos disponíveis no momento.');
      setBuscando(false);
      return;
    }

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      setErro('Chave da API Gemini não configurada.');
      setBuscando(false);
      return;
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      // Filtrar veículos pelo tipo preferido primeiro
      const veiculosFiltrados = perfil.tipoPreferido
        ? veiculos.filter(v => v.categoria === perfil.tipoPreferido)
        : veiculos;

      const veiculosParaAnalise = veiculosFiltrados.length > 0 ? veiculosFiltrados : veiculos;

      const veiculosTexto = veiculosParaAnalise.map(v => 
        `ID: ${v.id}, ${v.marca} ${v.modelo} ${v.ano}, Categoria: ${v.categoria || 'N/A'}, Cor: ${v.cor}, KM: ${v.km}, Preço: R$ ${v.preco.toLocaleString('pt-BR')}, Descrição: ${v.descricao || 'N/A'}`
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
1. PRIORIZE FORTEMENTE o Tipo de Carro (Categoria) preferido pelo cliente (Hatch, Sedan ou Pickup). Se o cliente escolheu um tipo, você DEVE dar preferência absoluta a veículos dessa categoria.
2. CONSIDERE o Perfil do Cliente (idade e profissão) para entender suas necessidades:
   - Jovens geralmente preferem carros econômicos e modernos
   - Famílias precisam de espaço
   - Profissionais liberais valorizam conforto e status
   - Trabalhadores rurais ou comerciantes podem precisar de pickups
3. A RENDA é apenas um dado COMPLEMENTAR - não é o fator principal. Use apenas para verificar se o veículo está dentro da realidade financeira.
4. Seja persuasivo e mencione benefícios específicos para uso em Castanhal/PA (cidade pequena, ruas asfaltadas, proximidade com Belém, etc.).

Para cada veículo recomendado, gere um texto curto e persuasivo (2-3 frases) explicando por que aquele carro "deu match" com o perfil do cliente.

Responda APENAS em formato JSON válido:
{
  "matches": [
    {
      "id": "id_do_veiculo",
      "explicacao": "Texto persuasivo explicando o match"
    }
  ]
}

Recomende no máximo 3 veículos, sempre priorizando a categoria preferida e o perfil.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const textoResposta = response.text();
      
      // Extrair JSON da resposta
      const jsonMatch = textoResposta.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const resultado = JSON.parse(jsonMatch[0]);
        const matchesData = resultado.matches || [];
        
        const matchesFinais: MatchResult[] = [];
        for (const match of matchesData) {
          const veiculo = veiculosParaAnalise.find(v => v.id === match.id);
          if (veiculo) {
            matchesFinais.push({
              veiculo,
              explicacao: match.explicacao,
            });
          }
        }
        
        setMatches(matchesFinais);
        
        if (matchesFinais.length === 0) {
          setErro('Não encontramos veículos compatíveis com seu perfil. Tente ajustar suas preferências.');
        }
      } else {
        throw new Error('Resposta inválida da IA');
      }
    } catch (err) {
      console.error(err);
      setErro('Não foi possível obter recomendações. Verifique sua conexão e tente novamente.');
    }

    setBuscando(false);
  };

  const formatarPreco = (preco: number) =>
    preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatarKm = (km: number) =>
    km.toLocaleString('pt-BR') + ' km';

  const categoriaNome = (cat: string) => {
    const nomes: Record<string, string> = {
      hatch: 'Hatch',
      sedan: 'Sedan',
      pickup: 'Pickup',
    };
    return nomes[cat] || cat;
  };

  return (
    <div className="cliente-match">
      <div className="match-intro">
        <h2>Encontre seu carro ideal</h2>
        <p>Preencha seus dados e nossa IA vai recomendar os melhores veículos para você em Castanhal!</p>
      </div>

      <form onSubmit={buscarMatch} className="match-form">
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
              Encontrar meu Match
            </>
          )}
        </button>
      </form>

      {matches.length > 0 && (
        <div className="recomendacoes">
          <div className="recomendacoes-header">
            <h3>Carros que deram Match com você!</h3>
          </div>

          <div className="recomendacoes-grid">
            {matches.map(({ veiculo: v, explicacao }) => (
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
                  <span className="badge-recomendado">Match!</span>
                </div>
                <div className="veiculo-info">
                  <h3 className="veiculo-nome">{v.marca} {v.modelo}</h3>
                  <div className="veiculo-badges">
                    <span className="badge">{v.ano}</span>
                    <span className="badge">{v.cor}</span>
                    {v.categoria && <span className="badge badge-categoria">{categoriaNome(v.categoria)}</span>}
                    <span className="badge">{formatarKm(v.km)}</span>
                  </div>
                  <p className="match-explicacao">{explicacao}</p>
                  <div className="veiculo-footer">
                    <span className="veiculo-preco">{formatarPreco(v.preco)}</span>
                    <a
                      href={`https://wa.me/5591999999999?text=Olá! Vi o ${v.marca} ${v.modelo} no site Wyllkens Wcar e tenho interesse!`}
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
