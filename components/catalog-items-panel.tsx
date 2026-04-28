'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  BadgeDollarSign,
  CheckCircle2,
  ClipboardList,
  Filter,
  Layers3,
  Loader2,
  Package2,
  Plus,
  Save,
  Search,
  Sparkles,
  Tag,
} from 'lucide-react'

type Account = {
  id: string
  name: string
  role?: string
}

type CatalogItem = {
  id: string
  account_id: string
  category: string
  name: string
  description: string
  base_price: number
  specifications: Record<string, unknown>
  is_active: boolean
  created_at?: string | null
}

type CatalogItemsPanelProps = {
  account: Account | null
}

type EditorState = {
  id?: string
  category: string
  name: string
  description: string
  base_price: string
  specificationsText: string
  is_active: boolean
}

const CATEGORY_SUGGESTIONS = ['web', 'seguros', 'retail', 'servicios', 'consultoria']

function createEmptyEditor(): EditorState {
  return {
    category: '',
    name: '',
    description: '',
    base_price: '',
    specificationsText: '{\n  "beneficios": [],\n  "entregables": []\n}',
    is_active: true,
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(value || 0)
}

function prettyJson(value: Record<string, unknown>) {
  return JSON.stringify(value && Object.keys(value).length > 0 ? value : { beneficios: [], entregables: [] }, null, 2)
}

function toEditorState(item?: CatalogItem | null): EditorState {
  if (!item) return createEmptyEditor()
  return {
    id: item.id,
    category: item.category || '',
    name: item.name || '',
    description: item.description || '',
    base_price: String(item.base_price ?? ''),
    specificationsText: prettyJson(item.specifications || {}),
    is_active: item.is_active,
  }
}

export function CatalogItemsPanel({ account }: CatalogItemsPanelProps) {
  const [items, setItems] = useState<CatalogItem[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editor, setEditor] = useState<EditorState>(createEmptyEditor())
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [jsonError, setJsonError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCatalog() {
      if (!account?.id) {
        setItems([])
        setSelectedId(null)
        setEditor(createEmptyEditor())
        return
      }

      setLoading(true)
      setError(null)
      setFeedback(null)

      try {
        const url = process.env.NEXT_PUBLIC_API_URL
        const res = await fetch(`${url}/products?account_id=${account.id}&include_inactive=true`)

        if (!res.ok) {
          throw new Error('No fue posible cargar el catalogo de esta cuenta.')
        }

        const data: CatalogItem[] = await res.json()
        setItems(Array.isArray(data) ? data : [])

        if (Array.isArray(data) && data.length > 0) {
          const first = data[0]
          setSelectedId(first.id)
          setEditor(toEditorState(first))
        } else {
          setSelectedId(null)
          setEditor(createEmptyEditor())
        }
      } catch (err: any) {
        setError(err.message || 'No fue posible cargar el catalogo.')
      } finally {
        setLoading(false)
      }
    }

    loadCatalog()
  }, [account?.id])

  const categories = useMemo(() => {
    const dynamic = Array.from(new Set(items.map((item) => item.category).filter(Boolean)))
    return ['all', ...dynamic]
  }, [items])

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        !search ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase())

      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && item.is_active) ||
        (statusFilter === 'inactive' && !item.is_active)

      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [items, search, categoryFilter, statusFilter])

  const selectedItem = items.find((item) => item.id === selectedId) || null
  const hasChanges = useMemo(() => {
    const baseline = toEditorState(selectedItem)
    return JSON.stringify(editor) !== JSON.stringify(baseline)
  }, [editor, selectedItem])

  const stats = useMemo(() => {
    const activeItems = items.filter((item) => item.is_active)
    const totalPrice = activeItems.reduce((sum, item) => sum + (item.base_price || 0), 0)
    const categoriesCount = new Set(items.map((item) => item.category).filter(Boolean)).size

    return {
      total: items.length,
      active: activeItems.length,
      categories: categoriesCount,
      average: activeItems.length > 0 ? totalPrice / activeItems.length : 0,
    }
  }, [items])

  function handleSelect(item: CatalogItem) {
    setSelectedId(item.id)
    setEditor(toEditorState(item))
    setError(null)
    setFeedback(null)
    setJsonError(null)
  }

  function handleNewItem() {
    setSelectedId(null)
    setEditor(createEmptyEditor())
    setFeedback(null)
    setError(null)
    setJsonError(null)
  }

  async function handleSave() {
    if (!account?.id) return

    let specifications: Record<string, unknown> = {}
    try {
      specifications = editor.specificationsText.trim() ? JSON.parse(editor.specificationsText) : {}
      setJsonError(null)
    } catch {
      setJsonError('El bloque de especificaciones debe ser JSON valido.')
      return
    }

    if (!editor.name.trim() || !editor.category.trim() || !editor.base_price.trim()) {
      setError('Completa categoria, nombre y precio base antes de guardar.')
      return
    }

    const parsedPrice = Number(editor.base_price)
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setError('El precio base debe ser un numero valido mayor o igual a cero.')
      return
    }

    setSaving(true)
    setError(null)
    setFeedback(null)

    const payload = {
      account_id: account.id,
      category: editor.category.trim(),
      name: editor.name.trim(),
      description: editor.description.trim(),
      base_price: parsedPrice,
      specifications,
      is_active: editor.is_active,
    }

    try {
      const url = process.env.NEXT_PUBLIC_API_URL
      const isEditing = Boolean(selectedId)
      const endpoint = isEditing
        ? `${url}/products/${selectedId}?account_id=${account.id}`
        : `${url}/products`

      const requestBody = isEditing
        ? {
            category: payload.category,
            name: payload.name,
            description: payload.description,
            base_price: payload.base_price,
            specifications: payload.specifications,
            is_active: payload.is_active,
          }
        : payload

      const res = await fetch(endpoint, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!res.ok) {
        throw new Error(isEditing ? 'No fue posible actualizar el item.' : 'No fue posible crear el item.')
      }

      const saved: CatalogItem = await res.json()

      setItems((current) => {
        if (isEditing) {
          return current.map((item) => (item.id === saved.id ? saved : item))
        }
        return [saved, ...current]
      })
      setSelectedId(saved.id)
      setEditor(toEditorState(saved))
      setFeedback(isEditing ? 'Item actualizado correctamente.' : 'Item creado correctamente para esta cuenta.')
    } catch (err: any) {
      setError(err.message || 'No fue posible guardar el item.')
    } finally {
      setSaving(false)
    }
  }

  if (!account) {
    return (
      <section className="p-8">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8">
          <p className="mb-3 text-sm uppercase tracking-[0.2em] text-slate-500">Catalogo</p>
          <h2 className="mb-3 text-3xl font-bold text-white">Selecciona una cuenta para administrar su oferta</h2>
          <p className="max-w-2xl leading-relaxed text-slate-400">
            El catalogo vive por cuenta. Cuando elijas una cuenta activa desde el selector superior, cargaremos sus
            servicios y productos asociados a <span className="font-medium text-slate-200">catalog_items.account_id</span>.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-8 p-8">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="mb-3 text-sm uppercase tracking-[0.2em] text-slate-500">Catalogo</p>
          <h2 className="mb-2 text-3xl font-bold text-white">Gestiona la oferta comercial de {account.name}</h2>
          <p className="max-w-3xl leading-relaxed text-slate-400">
            Crea y mantiene productos o servicios visibles para esta cuenta. El bot tomara estos items como base para
            vender, orientar y cotizar desde WhatsApp.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-300">
            <span className="text-slate-500">Cuenta:</span> {account.name}
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-300">
            <span className="text-slate-500">Rol:</span> {account.role || 'admin'}
          </div>
          <button
            type="button"
            onClick={handleNewItem}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-500"
          >
            <Plus size={16} />
            Nuevo item
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={<ClipboardList className="text-blue-400" />} label="Items totales" value={String(stats.total)} />
        <MetricCard icon={<CheckCircle2 className="text-emerald-400" />} label="Activos" value={String(stats.active)} />
        <MetricCard icon={<Layers3 className="text-violet-400" />} label="Categorias" value={String(stats.categories)} />
        <MetricCard icon={<BadgeDollarSign className="text-amber-400" />} label="Ticket base medio" value={formatCurrency(stats.average)} />
      </div>

      <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,1.15fr)_minmax(380px,0.85fr)]">
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40">
          <div className="border-b border-slate-800 px-6 py-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="flex items-center gap-2 font-semibold text-white">
                  <Package2 size={18} className="text-blue-400" />
                  Catalogo operativo
                </div>
                <p className="mt-1 text-sm text-slate-400">
                  Prioriza claridad comercial: nombre, categoria, precio base y alcance visible para el bot.
                </p>
              </div>

              <div className="flex flex-1 flex-col gap-3 xl:max-w-2xl xl:flex-row">
                <div className="flex items-center rounded-xl border border-slate-800 bg-[#020617] px-3 py-2 text-sm text-slate-300 xl:flex-1">
                  <Search size={16} className="mr-2 text-slate-500" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por nombre, descripcion o categoria"
                    className="w-full bg-transparent outline-none placeholder:text-slate-500"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-[#020617] px-3 py-2 text-sm text-slate-300">
                    <Filter size={16} className="text-slate-500" />
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="bg-transparent outline-none"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category} className="bg-slate-950">
                          {category === 'all' ? 'Todas las categorias' : category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="inline-flex rounded-xl border border-slate-800 bg-[#020617] p-1 text-sm">
                    {[
                      { key: 'all', label: 'Todos' },
                      { key: 'active', label: 'Activos' },
                      { key: 'inactive', label: 'Inactivos' },
                    ].map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => setStatusFilter(option.key as 'all' | 'active' | 'inactive')}
                        className={`rounded-lg px-3 py-1.5 transition-colors ${
                          statusFilter === option.key ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center px-6 py-20 text-slate-400">
              <Loader2 className="mr-3 h-5 w-5 animate-spin" />
              Cargando items de esta cuenta...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-800 bg-slate-950 text-slate-500">
                <Package2 size={22} />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Aun no hay items que mostrar</h3>
              <p className="mx-auto max-w-xl text-sm leading-6 text-slate-400">
                Crea el primer servicio o producto de esta cuenta para que el agente tenga una base real de oferta.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className={`w-full px-6 py-5 text-left transition-colors hover:bg-slate-800/30 ${
                    selectedId === item.id ? 'bg-blue-600/10' : ''
                  }`}
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-slate-700 bg-slate-950 px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-400">
                          {item.category}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                            item.is_active
                              ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                              : 'border border-slate-700 bg-slate-900 text-slate-400'
                          }`}
                        >
                          {item.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                      <h3 className="truncate text-lg font-semibold text-white">{item.name}</h3>
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{item.description || 'Sin descripcion comercial.'}</p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-sm text-slate-500">Precio base</p>
                      <p className="text-lg font-semibold text-emerald-300">{formatCurrency(item.base_price)}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40">
          <div className="border-b border-slate-800 px-6 py-5">
            <div className="flex items-center gap-2 font-semibold text-white">
              <Sparkles size={18} className="text-violet-400" />
              {selectedId ? 'Editor del item' : 'Nuevo item de catalogo'}
            </div>
            <p className="mt-1 text-sm text-slate-400">
              Diseña una ficha comercial clara para ventas y para el grounding del bot.
            </p>
          </div>

          <div className="space-y-5 px-6 py-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Categoria">
                <input
                  value={editor.category}
                  onChange={(e) => setEditor((current) => ({ ...current, category: e.target.value }))}
                  placeholder="Ej: web"
                  className="w-full rounded-xl border border-slate-800 bg-[#020617] px-4 py-3 text-sm text-slate-100 outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20"
                />
              </Field>

              <Field label="Precio base">
                <input
                  value={editor.base_price}
                  onChange={(e) => setEditor((current) => ({ ...current, base_price: e.target.value }))}
                  inputMode="decimal"
                  placeholder="150000"
                  className="w-full rounded-xl border border-slate-800 bg-[#020617] px-4 py-3 text-sm text-slate-100 outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20"
                />
              </Field>
            </div>

            <div className="flex flex-wrap gap-2">
              {CATEGORY_SUGGESTIONS.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setEditor((current) => ({ ...current, category }))}
                  className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:border-slate-500 hover:text-white"
                >
                  {category}
                </button>
              ))}
            </div>

            <Field label="Nombre comercial">
              <input
                value={editor.name}
                onChange={(e) => setEditor((current) => ({ ...current, name: e.target.value }))}
                placeholder="Landing Page Tactica"
                className="w-full rounded-xl border border-slate-800 bg-[#020617] px-4 py-3 text-sm text-slate-100 outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20"
              />
            </Field>

            <Field label="Descripcion">
              <textarea
                value={editor.description}
                onChange={(e) => setEditor((current) => ({ ...current, description: e.target.value }))}
                rows={5}
                placeholder="Explica alcance, beneficios y enfoque comercial del item."
                className="w-full resize-y rounded-xl border border-slate-800 bg-[#020617] px-4 py-3 text-sm leading-6 text-slate-100 outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20"
              />
            </Field>

            <Field label="Especificaciones JSON">
              <textarea
                value={editor.specificationsText}
                onChange={(e) => setEditor((current) => ({ ...current, specificationsText: e.target.value }))}
                rows={11}
                spellCheck={false}
                className="w-full resize-y rounded-xl border border-slate-800 bg-[#020617] px-4 py-3 font-mono text-xs leading-6 text-slate-100 outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20"
              />
            </Field>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-white">Disponibilidad comercial</p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    Los items inactivos quedan preservados, pero el bot no deberia ofrecerlos como parte de la cuenta.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditor((current) => ({ ...current, is_active: !current.is_active }))}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    editor.is_active ? 'bg-emerald-500/80' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      editor.is_active ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {(feedback || error || jsonError) && (
              <div className="space-y-3">
                {feedback && (
                  <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-emerald-300">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                    <p className="text-sm leading-6">{feedback}</p>
                  </div>
                )}

                {(error || jsonError) && (
                  <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-300">
                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                    <p className="text-sm leading-6">{jsonError || error}</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col gap-3 border-t border-slate-800 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950 px-3 py-1.5">
                  <Tag size={14} className="text-slate-500" />
                  {editor.category || 'Sin categoria'}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950 px-3 py-1.5">
                  <BadgeDollarSign size={14} className="text-slate-500" />
                  {editor.base_price ? formatCurrency(Number(editor.base_price)) : 'Sin precio'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setEditor(toEditorState(selectedItem))}
                  disabled={!hasChanges}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-800 disabled:opacity-40"
                >
                  Revertir
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {selectedId ? 'Guardar cambios' : 'Crear item'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="rounded-lg bg-slate-800 p-2">{icon}</div>
      </div>
      <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-400">{label}</p>
      <h4 className="text-2xl font-bold text-white">{value}</h4>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-200">{label}</span>
      {children}
    </label>
  )
}
