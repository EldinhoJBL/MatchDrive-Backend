'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase, type Veiculo, type CategoriaVeiculo } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Pencil, Trash2, Car, Loader2, Save, X, ImageIcon, Upload } from 'lucide-react'

const CATEGORIAS: { value: CategoriaVeiculo; label: string; icon: string }[] = [
  { value: 'hatch', label: 'Hatch', icon: '🚗' },
  { value: 'sedan', label: 'Sedan', icon: '🚙' },
  { value: 'pickup', label: 'Pickup', icon: '🛻' },
]

export default function AdminPanel() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
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
      alert('Por favor, preencha todos os campos obrigatorios: Marca, Modelo, Ano, Preco e Categoria.')
      return
    }

    setSaving(true)

    try {
      let imagemUrl = formData.imagem_url

      // Se ha um arquivo selecionado, fazer upload primeiro
      if (selectedFile) {
        const uploadedUrl = await uploadImageToSupabase(selectedFile)
        if (uploadedUrl) {
          imagemUrl = uploadedUrl
        } else {
          // Se o upload falhar, perguntar se quer continuar sem imagem
          const continuar = confirm('Nao foi possivel fazer upload da imagem. Deseja cadastrar o veiculo sem imagem?')
          if (!continuar) {
            setSaving(false)
            return
          }
        }
      }

      const dadosParaSalvar = {
        marca: formData.marca,
        modelo: formData.modelo,
        ano: formData.ano,
        preco: formData.preco,
        categoria: formData.categoria,
        imagem: imagemUrl || null,
      }

      console.log("[v0] Dados para salvar:", dadosParaSalvar)

      if (editingId) {
        const { data, error } = await supabase
          .from('veiculos')
          .update(dadosParaSalvar)
          .eq('id', editingId)
          .select()

        console.log("[v0] Update response - data:", data, "error:", error)
        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from('veiculos')
          .insert([dadosParaSalvar])
          .select()

        console.log("[v0] Insert response - data:", data, "error:", error)
        if (error) throw error
      }

      await carregarVeiculos()
      resetForm()
    } catch (err: any) {
      console.error('[v0] Erro ao salvar:', err)
      const errorMessage = err?.message || err?.details || JSON.stringify(err)
      alert(`Erro ao salvar veiculo: ${errorMessage}`)
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
      marca: veiculo.marca || '',
      modelo: veiculo.modelo,
      ano: veiculo.ano || new Date().getFullYear(),
      preco: veiculo.preco,
      imagem_url: veiculo.imagem || veiculo.imagem_url || '',
      categoria: veiculo.categoria || 'hatch',
    })
    setPreviewUrl(veiculo.imagem || veiculo.imagem_url || '')
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
    setSelectedFile(null)
    setPreviewUrl('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatarPreco = (valor: string) => {
    const numero = valor.replace(/\D/g, '')
    return parseInt(numero) || 0
  }

  const getCategoriaLabel = (categoria: CategoriaVeiculo) => {
    return CATEGORIAS.find(c => c.value === categoria)?.label || categoria
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      // Criar preview local
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)
    }
  }

  const uploadImageToSupabase = async (file: File): Promise<string | null> => {
    try {
      setUploadingImage(true)
      
      // Gerar nome unico para o arquivo
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `veiculos/${fileName}`

      // Upload para o Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('fotos-veiculos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Erro no upload:', uploadError)
        // Se o bucket nao existir, mostrar mensagem mais clara
        if (uploadError.message.includes('Bucket not found') || uploadError.message.includes('bucket')) {
          alert('Bucket "fotos-veiculos" nao encontrado no Supabase Storage. Por favor, crie o bucket primeiro no painel do Supabase.')
        } else {
          alert(`Erro ao fazer upload da imagem: ${uploadError.message}`)
        }
        return null
      }

      // Obter URL publica
      const { data: publicUrlData } = supabase.storage
        .from('fotos-veiculos')
        .getPublicUrl(filePath)

      return publicUrlData.publicUrl
    } catch (err) {
      console.error('Erro no upload:', err)
      alert('Erro ao fazer upload da imagem. Tente novamente.')
      return null
    } finally {
      setUploadingImage(false)
    }
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

            {/* Upload de Foto */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                Foto do Veiculo
              </label>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="foto-veiculo"
              />
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-red-500/50 transition-colors bg-secondary"
              >
                {previewUrl || formData.imagem_url ? (
                  <div className="space-y-3">
                    <div className="aspect-video max-w-md mx-auto rounded-lg overflow-hidden bg-muted">
                      <img
                        src={previewUrl || formData.imagem_url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {selectedFile ? selectedFile.name : 'Clique para trocar a imagem'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">
                      Clique para selecionar uma foto
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Aceita JPG, PNG ou WEBP
                    </p>
                  </div>
                )}
              </div>
              
              {uploadingImage && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Fazendo upload da imagem...
                </div>
              )}
            </div>
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
                    {(veiculo.imagem || veiculo.imagem_url) ? (
                      <img
                        src={veiculo.imagem || veiculo.imagem_url}
                        alt={veiculo.modelo}
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
