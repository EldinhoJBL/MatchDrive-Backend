import { GoogleGenerativeAI } from '@google/generative-ai'
import type { CategoriaVeiculo } from './supabase'

const genAI = new GoogleGenerativeAI('AIzaSyCM2BulmitOoo3SKGdEItp2jK6NkvnkqlM')

const CATEGORIA_LABELS: Record<CategoriaVeiculo, string> = {
  hatch: 'Hatch',
  sedan: 'Sedan',
  pickup: 'Pickup',
}

export async function gerarArgumentoVenda(
  veiculo: { marca: string; modelo: string; ano: number; preco: number; categoria: CategoriaVeiculo },
  profissao: string,
  idade: number,
  renda: number,
  categoriaPreferida: CategoriaVeiculo
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const matchPerfeito = veiculo.categoria === categoriaPreferida
  const veiculoCompleto = `${veiculo.marca} ${veiculo.modelo} ${veiculo.ano}`
  const precoFormatado = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(veiculo.preco)

  const prompt = `Atue como um consultor da Wyllkens Wcar, uma consultoria automotiva premium localizada na Rua Primeiro de Maio, 1253 - Pirapora, em Castanhal, no Para. 

Recomende este ${veiculoCompleto} (${CATEGORIA_LABELS[veiculo.categoria]}) no valor de ${precoFormatado} para um(a) ${profissao} de ${idade} anos que busca um ${CATEGORIA_LABELS[categoriaPreferida]}.

Contexto adicional:
- Renda mensal do cliente: R$ ${renda.toLocaleString('pt-BR')}
${matchPerfeito ? '- Este veiculo corresponde EXATAMENTE ao tipo que o cliente deseja!' : `- O cliente preferia um ${CATEGORIA_LABELS[categoriaPreferida]}, mas este ${CATEGORIA_LABELS[veiculo.categoria]} e uma excelente opcao disponivel.`}

Diretrizes para o argumento:
1. Foque no CUSTO-BENEFICIO e no USO PRATICO do dia a dia para um(a) ${profissao}
2. Explique por que este veiculo e um BOM INVESTIMENTO para o perfil do cliente
3. Mencione vantagens praticas para a regiao de Castanhal e Para (estradas, clima tropical, deslocamentos para Belem e regiao)
4. Destaque o valor de REVENDA na regiao - veiculos bem conservados tem otima liquidez em Castanhal e cidades vizinhas
5. Se o preco for elevado em relacao a renda, apresente como um investimento de longo prazo com durabilidade comprovada
6. Personalize os beneficios para a rotina de um(a) ${profissao}
7. Seja persuasivo, confiante e profissional
8. Mantenha entre 3-4 paragrafos, fluido e convincente
9. Nao use listas ou bullet points, escreva em texto corrido
10. Mencione a Wyllkens Wcar como referencia em consultoria automotiva premium na regiao de Castanhal
11. Lembre que a Wyllkens Wcar oferece: Compra, Venda, Troca e Financiamento

Escreva o argumento de vendas agora:`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Erro ao gerar argumento:', error)
    return 'Nao foi possivel gerar o argumento de vendas no momento. Por favor, entre em contato com a Wyllkens Wcar pelo telefone (91) 98723-8874.'
  }
}
