'use client'

import { useState } from 'react'
import { supabase, type Veiculo, type CategoriaVeiculo } from '@/lib/supabase'
import { gerarArgumentoVenda } from '@/lib/gemini'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, DollarSign, Briefcase, Car, Sparkles, Loader2, MapPin, Phone } from 'lucide-react'

const CATEGORIAS: { value: CategoriaVeiculo; label: string; icon: string; descricao: string }[] = [
  { value: 'hatch', label: 'Hatch', icon: '🚗', descricao: 'Compacto e economico' },
  { value: 'sedan', label: 'Sedan', icon: '🚙', descricao: 'Conforto e espaco' },
  { value: 'pickup', label: 'Pickup', icon: '🛻', descricao: 'Forca e versatilidade' },
]

// Perfis de prioridade baseados na profissao
const PERFIS_PROFISSIONAIS: Record<string, { prioridade: 'economico' | 'conforto' | 'versatil'; descricao: string }> = {
  // Autonomos e estudantes - priorizam economia
  'autonomo': { prioridade: 'economico', descricao: 'praticidade e economia no dia a dia' },
  'freelancer': { prioridade: 'economico', descricao: 'praticidade e economia no dia a dia' },
  'estudante': { prioridade: 'economico', descricao: 'economia e baixo custo de manutencao' },
  'universitario': { prioridade: 'economico', descricao: 'economia e baixo custo de manutencao' },
  'estagiario': { prioridade: 'economico', descricao: 'economia para quem esta comecando' },
  'uber': { prioridade: 'economico', descricao: 'economia de combustivel e durabilidade' },
  '99': { prioridade: 'economico', descricao: 'economia de combustivel e durabilidade' },
  'motorista': { prioridade: 'economico', descricao: 'economia de combustivel e durabilidade' },
  
  // Profissionais estabelecidos - priorizam conforto
  'medico': { prioridade: 'conforto', descricao: 'conforto apos longas jornadas' },
  'advogado': { prioridade: 'conforto', descricao: 'imagem profissional e conforto' },
  'engenheiro': { prioridade: 'conforto', descricao: 'seguranca e tecnologia' },
  'empresario': { prioridade: 'conforto', descricao: 'imagem e representatividade' },
  'gerente': { prioridade: 'conforto', descricao: 'conforto para longas jornadas' },
  'diretor': { prioridade: 'conforto', descricao: 'status e conforto premium' },
  'professor': { prioridade: 'conforto', descricao: 'conforto para o trajeto diario' },
  'servidor': { prioridade: 'conforto', descricao: 'estabilidade e durabilidade' },
  'funcionario publico': { prioridade: 'conforto', descricao: 'estabilidade e durabilidade' },
  
  // Profissionais de campo - priorizam versatilidade
  'agricultor': { prioridade: 'versatil', descricao: 'robustez para estradas rurais' },
  'fazendeiro': { prioridade: 'versatil', descricao: 'capacidade de carga e terrenos dificeis' },
  'pecuarista': { prioridade: 'versatil', descricao: 'versatilidade no campo' },
  'construtor': { prioridade: 'versatil', descricao: 'capacidade de carga' },
  'pedreiro': { prioridade: 'versatil', descricao: 'transporte de materiais' },
  'eletricista': { prioridade: 'versatil', descricao: 'espaco para ferramentas' },
  'comerciante': { prioridade: 'versatil', descricao: 'transporte de mercadorias' },
  'vendedor': { prioridade: 'versatil', descricao: 'espaco para amostras e materiais' },
}

function identificarPerfilProfissional(profissao: string): { prioridade: 'economico' | 'conforto' | 'versatil'; descricao: string } {
  const profissaoNormalizada = profissao.toLowerCase().trim()
  
  for (const [key, value] of Object.entries(PERFIS_PROFISSIONAIS)) {
    if (profissaoNormalizada.includes(key)) {
      return value
    }
  }
  
  // Perfil padrao para profissoes nao mapeadas
  return { prioridade: 'conforto', descricao: 'equilibrio entre conforto e praticidade' }
}

function calcularScoreVeiculo(
  veiculo: Veiculo,
  categoriaPreferida: CategoriaVeiculo,
  idade: number,
  perfilProfissional: { prioridade: 'economico' | 'conforto' | 'versatil' }
): number {
  let score = 0
  
  // Peso principal: categoria preferida (40 pontos)
  if (veiculo.categoria === categoriaPreferida) {
    score += 40
  }
  
  // Peso secundario: perfil profissional (30 pontos)
  if (perfilProfissional.prioridade === 'economico' && veiculo.categoria === 'hatch') {
    score += 30
  } else if (perfilProfissional.prioridade === 'conforto' && veiculo.categoria === 'sedan') {
    score += 30
  } else if (perfilProfissional.prioridade === 'versatil' && veiculo.categoria === 'pickup') {
    score += 30
  } else {
    score += 15 // Bonus parcial se nao for o ideal do perfil
  }
  
  // Peso terciario: idade (20 pontos)
  if (idade < 30) {
    // Jovens: preferem carros mais novos e economicos
    if (veiculo.ano >= 2020) score += 15
    if (veiculo.categoria === 'hatch') score += 5
  } else if (idade >= 30 && idade < 50) {
    // Adultos: equilibrio entre conforto e custo-beneficio
    if (veiculo.ano >= 2018) score += 10
    if (veiculo.categoria === 'sedan') score += 10
  } else {
    // Mais velhos: priorizam conforto e seguranca
    if (veiculo.categoria === 'sedan') score += 15
    score += 5 // Bonus por preferir veiculos confiaveis
  }
  
  // Bonus por ano do veiculo (10 pontos)
  const anoAtual = new Date().getFullYear()
  const idadeVeiculo = anoAtual - veiculo.ano
  if (idadeVeiculo <= 3) score += 10
  else if (idadeVeiculo <= 5) score += 7
  else if (idadeVeiculo <= 8) score += 4
  
  return score
}

export function ConsultoriaDashboard() {
  const [idade, setIdade] = useState('')
  const [renda, setRenda] = useState('')
  const [profissao, setProfissao] = useState('')
  const [categoriaPreferida, setCategoriaPreferida] = useState<CategoriaVeiculo | ''>('')
  const [loading, setLoading] = useState(false)
  const [veiculoRecomendado, setVeiculoRecomendado] = useState<Veiculo | null>(null)
  const [argumentoVenda, setArgumentoVenda] = useState('')
  const [loadingArgumento, setLoadingArgumento] = useState(false)
  const [perfilIdentificado, setPerfilIdentificado] = useState<{ prioridade: string; descricao: string } | null>(null)

  const analisarPerfil = async () => {
    if (!idade || !renda || !profissao || !categoriaPreferida) {
      alert('Por favor, preencha todos os campos, incluindo o tipo de veiculo.')
      return
    }

    setLoading(true)
    setVeiculoRecomendado(null)
    setArgumentoVenda('')
    setPerfilIdentificado(null)

    try {
      const rendaNum = parseFloat(renda.replace(/\D/g, ''))
      const idadeNum = parseInt(idade)
      const perfilProfissional = identificarPerfilProfissional(profissao)
      setPerfilIdentificado(perfilProfissional)

      // Busca todos os veiculos da categoria preferida primeiro
      let { data: veiculosDaCategoria, error } = await supabase
        .from('veiculos')
        .select('*')
        .eq('categoria', categoriaPreferida)
        .order('ano', { ascending: false })

      if (error) {
        console.error('Erro ao buscar veiculos:', error)
        alert('Erro ao buscar veiculos. Verifique a conexao com o banco de dados.')
        return
      }

      let melhorVeiculo: Veiculo | null = null

      if (veiculosDaCategoria && veiculosDaCategoria.length > 0) {
        // Calcula o score de cada veiculo e encontra o melhor
        let melhorScore = -1
        
        for (const veiculo of veiculosDaCategoria) {
          const score = calcularScoreVeiculo(
            veiculo as Veiculo,
            categoriaPreferida,
            idadeNum,
            perfilProfissional
          )
          
          if (score > melhorScore) {
            melhorScore = score
            melhorVeiculo = veiculo as Veiculo
          }
        }
      }

      // Se nao encontrou na categoria preferida, busca em todas as categorias
      if (!melhorVeiculo) {
        const { data: todosVeiculos, error: errorTodos } = await supabase
          .from('veiculos')
          .select('*')
          .order('ano', { ascending: false })

        if (!errorTodos && todosVeiculos && todosVeiculos.length > 0) {
          let melhorScore = -1
          
          for (const veiculo of todosVeiculos) {
            const score = calcularScoreVeiculo(
              veiculo as Veiculo,
              categoriaPreferida,
              idadeNum,
              perfilProfissional
            )
            
            if (score > melhorScore) {
              melhorScore = score
              melhorVeiculo = veiculo as Veiculo
            }
          }
        }
      }

      if (melhorVeiculo) {
        setVeiculoRecomendado(melhorVeiculo)

        setLoadingArgumento(true)
        const argumento = await gerarArgumentoVenda(
          melhorVeiculo,
          profissao,
          idadeNum,
          rendaNum,
          categoriaPreferida
        )
        setArgumentoVenda(argumento)
        setLoadingArgumento(false)
      } else {
        alert('Nenhum veiculo disponivel no momento. Entre em contato para mais opcoes!')
      }
    } catch (err) {
      console.error('Erro:', err)
      alert('Ocorreu um erro ao analisar seu perfil.')
    } finally {
      setLoading(false)
    }
  }

  const formatarMoeda = (valor: string) => {
    const numero = valor.replace(/\D/g, '')
    const formatado = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(parseInt(numero) || 0)
    return formatado
  }

  const getCategoriaLabel = (categoria: CategoriaVeiculo) => {
    return CATEGORIAS.find(c => c.value === categoria)?.label || categoria
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2 text-red-500">
          <MapPin className="h-5 w-5" />
          <span className="text-sm font-medium">Consultoria Automotiva Premium em Castanhal</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          Encontre o Veiculo <span className="text-red-500">Perfeito</span> para Voce
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Preencha seus dados e nossa inteligencia artificial encontrara o veiculo ideal para seu perfil. 
          Atendemos toda a regiao de Castanhal, Santa Izabel, Benevides e regiao metropolitana.
        </p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-red-500" />
            Dados do Cliente
          </CardTitle>
          <CardDescription>
            Informe seus dados para uma analise personalizada com a Wyllkens Wcar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Idade
              </label>
              <Input
                type="number"
                placeholder="Ex: 35"
                value={idade}
                onChange={(e) => setIdade(e.target.value)}
                className="bg-secondary border-border focus:border-red-500 focus:ring-red-500/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                Renda Mensal
              </label>
              <Input
                type="text"
                placeholder="Ex: R$ 5.000"
                value={renda}
                onChange={(e) => setRenda(formatarMoeda(e.target.value))}
                className="bg-secondary border-border focus:border-red-500 focus:ring-red-500/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                Profissao
              </label>
              <Input
                type="text"
                placeholder="Ex: Engenheiro, Medico, Autonomo..."
                value={profissao}
                onChange={(e) => setProfissao(e.target.value)}
                className="bg-secondary border-border focus:border-red-500 focus:ring-red-500/20"
              />
            </div>
          </div>

          {/* Seletor de Categoria */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Car className="h-4 w-4 text-muted-foreground" />
              Qual tipo de carro voce prefere?
            </label>
            <div className="grid grid-cols-3 gap-3">
              {CATEGORIAS.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategoriaPreferida(cat.value)}
                  className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                    categoriaPreferida === cat.value
                      ? 'border-red-500 bg-red-500/10 text-red-500'
                      : 'border-border bg-secondary hover:border-red-500/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="font-medium">{cat.label}</span>
                  <span className="text-xs opacity-70">{cat.descricao}</span>
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={analisarPerfil}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-6 text-lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analisando seu perfil...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Encontrar Meu Veiculo Ideal
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {veiculoRecomendado && (
        <Card className="bg-card border-red-600/50 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-red-600/10 to-red-800/10">
            <CardTitle className="flex items-center gap-2 text-red-500">
              <Car className="h-5 w-5" />
              Veiculo Recomendado pela Wyllkens Wcar
            </CardTitle>
            <CardDescription>
              {veiculoRecomendado.categoria === categoriaPreferida
                ? 'Este veiculo corresponde exatamente ao tipo que voce procura!'
                : `Recomendamos este ${getCategoriaLabel(veiculoRecomendado.categoria)} como uma excelente opcao para seu perfil`}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {perfilIdentificado && (
              <div className="mb-6 p-4 rounded-lg bg-red-600/10 border border-red-600/30">
                <p className="text-sm text-red-400">
                  <span className="font-semibold">Perfil identificado:</span> Priorizamos {perfilIdentificado.descricao}
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="aspect-video relative rounded-lg overflow-hidden bg-secondary">
                {veiculoRecomendado.imagem_url ? (
                  <img
                    src={veiculoRecomendado.imagem_url}
                    alt={`${veiculoRecomendado.marca} ${veiculoRecomendado.modelo}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Car className="h-20 w-20 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-500/20 text-red-400">
                      {getCategoriaLabel(veiculoRecomendado.categoria)}
                    </span>
                    {veiculoRecomendado.categoria === categoriaPreferida && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400">
                        Match Perfeito
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">
                    {veiculoRecomendado.marca} {veiculoRecomendado.modelo}
                  </h3>
                  <p className="text-muted-foreground">Ano: {veiculoRecomendado.ano}</p>
                </div>
                <div className="bg-gradient-to-r from-red-600/10 to-red-800/10 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Investimento</p>
                  <p className="text-3xl font-bold text-red-500">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(veiculoRecomendado.preco)}
                  </p>
                </div>
                <div className="space-y-2">
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                    Agendar Visita na Wyllkens Wcar
                  </Button>
                  <Button variant="outline" className="w-full border-red-500/50 text-red-500 hover:bg-red-500/10">
                    <Phone className="mr-2 h-4 w-4" />
                    (91) 98723-8874
                  </Button>
                </div>
              </div>
            </div>

            {(loadingArgumento || argumentoVenda) && (
              <div className="mt-6 pt-6 border-t border-border">
                <h4 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-red-500" />
                  Por que este veiculo e ideal para voce
                </h4>
                {loadingArgumento ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Gerando argumento personalizado com IA...
                  </div>
                ) : (
                  <div className="prose prose-invert max-w-none">
                    <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                      {argumentoVenda}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
