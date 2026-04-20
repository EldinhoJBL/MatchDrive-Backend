'use client'

import { useState, useEffect } from 'react'
import { supabase, type Veiculo, type CategoriaVeiculo } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Pencil, Trash2, Car, Loader2, Save, X, ImageIcon } from 'lucide-react'

const CATEGORIAS: { value: CategoriaVeiculo; label: string; icon: string }[] = [
  { value: 'hatch', label: 'Hatch', icon: '🚗' },
  { value: 'sedan', label: 'Sedan', icon: '🚙' },
  { value: 'pickup', label: 'Pickup', icon: '🛻' },
]

export default function AdminPanel() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<Omit<Veiculo, 'id' | 'created_at'>>({
    marca: '',
    modelo: '',
    ano: new Date().getFullYear(),
    preco: 0,
    imagem_url: '',
    categoria: 'hatch',
  })

  useEffect(() => {
    carregarVeiculos()
  }, [])

  const carregarVeiculos = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('veiculos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao carregar veiculos:', error)
    } else {
      setVeiculos(data || [])
    }
    setLoading(false)
  }

  const salvarVeiculo = async () => {
    if (!formData.marca || !formData.modelo || !formData.ano || !formData.preco || !formData.categoria) {
      alert('Por favor, preencha todos os campos obrigatorios, incluindo a categoria.')
      return
    }

    setSaving(true)

    try {
      if (editingId) {
        const { error } = await supabase
          .from('veiculos')
          .update(formData)
          .eq('id', editingId)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('veiculos')
          .insert([formData])

        if (error) throw error
      }

      await carregarVeiculos()
      resetForm()
    } catch (err) {
      console.error('Erro ao salvar:', err)
      alert('Erro ao salvar veiculo. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const excluirVeiculo = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este veiculo?')) return

    const { error } = await supabase
      .from('veiculos')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao excluir:', error)
      alert('Erro ao excluir veiculo.')
    } else {
      await carregarVeiculos()
    }
  }

  const editarVeiculo = (veiculo: Veiculo) => {
    setFormData({
      marca: veiculo.marca,
      modelo: veiculo.modelo,
      ano: veiculo.ano,
      preco: veiculo.preco,
      imagem_url: veiculo.imagem_url,
      categoria: veiculo.categoria || 'hatch',
    })
    setEditingId(veiculo.id || null)
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      marca: '',
      modelo: '',
      ano: new Date().getFullYear(),
      preco: 0,
      imagem_url: '',
      categoria: 'hatch',
    })
    setEditingId(null)
    setShowForm(false)
  }

  const formatarPreco = (valor: string) => {
    const numero = valor.replace(/\D/g, '')
    return parseInt(numero) || 0
  }

  const getCategoriaLabel = (categoria: CategoriaVeiculo) => {
    return CATEGORIAS.find(c => c.value === categoria)?.label || categoria
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Gestao de Estoque <span className="text-red-500">Wyllkens Wcar</span>
          </h2>
          <p className="text-muted-foreground">Gerencie os veiculos disponiveis - Consultoria Automotiva Premium em Castanhal</p>
        </div>
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Veiculo
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="bg-card border-red-600/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5 text-red-500" />
              {editingId ? 'Editar Veiculo' : 'Cadastrar Novo Veiculo'}
            </CardTitle>
            <CardDescription>
              Preencha os dados do veiculo para o estoque da Wyllkens Wcar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Marca *</label>
                <Input
                  placeholder="Ex: Toyota"
                  value={formData.marca}
                  onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                  className="bg-secondary border-border focus:border-red-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Modelo *</label>
                <Input
                  placeholder="Ex: Corolla"
                  value={formData.modelo}
                  onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                  className="bg-secondary border-border focus:border-red-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Ano *</label>
                <Input
                  type="number"
                  placeholder="Ex: 2024"
                  value={formData.ano}
                  onChange={(e) => setFormData({ ...formData, ano: parseInt(e.target.value) || 0 })}
                  className="bg-secondary border-border focus:border-red-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Preco (R$) *</label>
                <Input
                  type="text"
                  placeholder="Ex: 150000"
                  value={formData.preco || ''}
                  onChange={(e) => setFormData({ ...formData, preco: formatarPreco(e.target.value) })}
                  className="bg-secondary border-border focus:border-red-500"
                />
              </div>
            </div>

            {/* Seletor de Categoria Obrigatorio */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Car className="h-4 w-4 text-muted-foreground" />
                Categoria do Veiculo *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {CATEGORIAS.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, categoria: cat.value })}
                    className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                      formData.categoria === cat.value
                        ? 'border-red-500 bg-red-500/10 text-red-500'
                        : 'border-border bg-secondary hover:border-red-500/50 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="font-medium">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                URL da Imagem
              </label>
              <Input
                type="url"
                placeholder="https://exemplo.com/imagem.jpg"
                value={formData.imagem_url}
                onChange={(e) => setFormData({ ...formData, imagem_url: e.target.value })}
                className="bg-secondary border-border focus:border-red-500"
              />
            </div>
            {formData.imagem_url && (
              <div className="aspect-video max-w-md rounded-lg overflow-hidden bg-secondary">
                <img
                  src={formData.imagem_url}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              </div>
            )}
            <div className="flex gap-2">
              <Button
                onClick={salvarVeiculo}
                disabled={saving}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {editingId ? 'Atualizar' : 'Cadastrar'}
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Veiculos em Estoque</CardTitle>
          <CardDescription>
            {veiculos.length} veiculo(s) cadastrado(s) na Wyllkens Wcar - Castanhal
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-red-500" />
            </div>
          ) : veiculos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Car className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum veiculo cadastrado ainda.</p>
              <p className="text-sm">Clique em &quot;Novo Veiculo&quot; para comecar.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {veiculos.map((veiculo) => (
                <Card key={veiculo.id} className="bg-secondary border-border overflow-hidden">
                  <div className="aspect-video relative bg-muted">
                    {veiculo.imagem_url ? (
                      <img
                        src={veiculo.imagem_url}
                        alt={`${veiculo.marca} ${veiculo.modelo}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Car className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    {/* Badge de Categoria */}
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-background/90 text-red-500 border border-red-500/30">
                        {getCategoriaLabel(veiculo.categoria)}
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground">
                      {veiculo.marca} {veiculo.modelo}
                    </h3>
                    <p className="text-sm text-muted-foreground">Ano: {veiculo.ano}</p>
                    <p className="text-lg font-bold text-red-500 mt-2">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(veiculo.preco)}
                    </p>
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => editarVeiculo(veiculo)}
                        className="flex-1"
                      >
                        <Pencil className="mr-1 h-3 w-3" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => excluirVeiculo(veiculo.id!)}
                        className="flex-1"
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        Excluir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
