'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Clock3,
  ExternalLink,
  FileText,
  Loader2,
  Mail,
  MessageCircleMore,
  Phone,
  Search,
  Send,
  UserRound,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  MoreVertical,
  ChevronRight,
  ShieldCheck,
  Calendar,
  DollarSign,
} from 'lucide-react'

type Account = {
  id: string
  name: string
  role?: string
}

type ChatMessage = {
  sender?: string
  message?: string
  timestamp?: string
}

type QuoteItem = {
  id: string
  client_name: string
  client_email: string
  phone: string
  phone_digits?: string
  product: string
  category: string
  product_description: string
  requirements: string
  amount: number
  total: string
  status: string
  date: string
  created_at: string
  last_interaction?: string
  has_pdf: boolean
  pdf_url?: string | null
  whatsapp_url?: string | null
  chat_history: ChatMessage[]
}

type QuotesPanelProps = {
  account: Account | null
  initialQuoteId?: string | null
}

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Borrador', color: 'amber' },
  { value: 'pending', label: 'Pendiente', color: 'blue' },
  { value: 'pdf_generated', label: 'PDF Generado', color: 'violet' },
  { value: 'sent', label: 'Enviada', color: 'sky' },
  { value: 'accepted', label: 'Aceptada', color: 'emerald' },
  { value: 'pdf_failed_delivery', label: 'Error Envío', color: 'rose' },
]

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(value || 0)
}

function formatDate(value?: string) {
  if (!value) return 'Sin fecha'
  return new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function statusConfig(status?: string) {
  const normalized = (status || 'pending').toLowerCase()
  return STATUS_OPTIONS.find(opt => opt.value === normalized) || { value: normalized, label: normalized.replace(/_/g, ' '), color: 'slate' }
}

function statusClasses(status?: string) {
  const config = statusConfig(status)
  const colors: Record<string, string> = {
    emerald: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
    sky: 'border-sky-500/20 bg-sky-500/10 text-sky-400',
    violet: 'border-violet-500/20 bg-violet-500/10 text-violet-400',
    rose: 'border-rose-500/20 bg-rose-500/10 text-rose-400',
    amber: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
    blue: 'border-blue-500/20 bg-blue-500/10 text-blue-400',
    slate: 'border-slate-500/20 bg-slate-500/10 text-slate-400',
  }
  return colors[config.color] || colors.slate
}

export function QuotesPanel({ account, initialQuoteId }: QuotesPanelProps) {
  const [quotes, setQuotes] = useState<QuoteItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedId, setSelectedId] = useState<string | null>(initialQuoteId || null)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  const loadQuotes = async () => {
    if (!account?.id) {
      setQuotes([])
      setSelectedId(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const url = process.env.NEXT_PUBLIC_API_URL
      const res = await fetch(`${url}/quotes?account_id=${account.id}&limit=100`)

      if (!res.ok) {
        throw new Error('No fue posible cargar las cotizaciones de esta cuenta.')
      }

      const data: QuoteItem[] = await res.json()
      const nextQuotes = Array.isArray(data) ? data : []
      setQuotes(nextQuotes)
      
      // Select logic
      if (initialQuoteId && nextQuotes.some(q => q.id === initialQuoteId)) {
        setSelectedId(initialQuoteId)
      } else if (!selectedId || !nextQuotes.some(q => q.id === selectedId)) {
        setSelectedId(nextQuotes[0]?.id || null)
      }
    } catch (err: any) {
      setError(err.message || 'No fue posible cargar las cotizaciones.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialQuoteId) {
      setSelectedId(initialQuoteId)
    }
  }, [initialQuoteId])

  useEffect(() => {
    loadQuotes()
  }, [account?.id])

  const handleStatusChange = async (quoteId: string, newStatus: string) => {
    setUpdatingStatus(quoteId)
    try {
      const url = process.env.NEXT_PUBLIC_API_URL
      const res = await fetch(`${url}/quotes/${quoteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        setQuotes(prev => prev.map(q => q.id === quoteId ? { ...q, status: newStatus } : q))
      }
    } catch (err) {
      console.error('Error updating status', err)
    } finally {
      setUpdatingStatus(null)
    }
  }

  const filteredQuotes = useMemo(() => {
    return quotes.filter((quote) => {
      const text = `${quote.client_name} ${quote.phone} ${quote.product} ${quote.requirements}`.toLowerCase()
      const matchesSearch = !search || text.includes(search.toLowerCase())
      const matchesStatus = statusFilter === 'all' || quote.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [quotes, search, statusFilter])

  const selectedQuote = useMemo(() => 
    filteredQuotes.find((quote) => quote.id === selectedId) || filteredQuotes[0] || null
  , [filteredQuotes, selectedId])

  const stats = useMemo(() => {
    const sent = quotes.filter((quote) => quote.status === 'sent').length
    const accepted = quotes.filter((quote) => quote.status === 'accepted').length
    const withPdf = quotes.filter((quote) => quote.has_pdf).length
    const totalValue = quotes.reduce((sum, quote) => sum + (quote.amount || 0), 0)

    return {
      total: quotes.length,
      sent,
      accepted,
      withPdf,
      totalValue,
    }
  }, [quotes])

  const pdfPreviewUrl =
    selectedQuote?.has_pdf && process.env.NEXT_PUBLIC_API_URL
      ? `${process.env.NEXT_PUBLIC_API_URL}/quotes/${selectedQuote.id}/pdf`
      : null

  if (!account) {
    return (
      <section className="p-8">
        <div className="rounded-[32px] border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900/60 dark:to-slate-900/20 p-12 backdrop-blur-xl text-center shadow-sm dark:shadow-none">
          <div className="mx-auto w-20 h-20 rounded-3xl bg-blue-600/10 flex items-center justify-center text-blue-500 dark:text-blue-400 mb-6 border border-blue-500/20">
            <ShieldCheck size={40} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Pipeline de Ventas</h2>
          <p className="max-w-xl mx-auto leading-relaxed text-slate-500 dark:text-slate-400 text-lg">
            Selecciona una cuenta en el panel superior para visualizar y gestionar las cotizaciones generadas por la IA.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6 p-4 lg:p-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 rounded-md bg-blue-600/10 text-blue-500 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider border border-blue-500/20">
              Commercial Module
            </span>
          </div>
          <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Gestión de <span className="bg-gradient-to-r from-blue-500 to-emerald-500 dark:from-blue-400 dark:to-emerald-400 bg-clip-text text-transparent">Cotizaciones</span>
          </h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-2xl text-base leading-relaxed">
            Monitorea leads, revisa propuestas generadas y cierra ventas con el contexto completo de la conversación.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Cuenta Activa</p>
            <p className="text-slate-900 dark:text-white font-semibold text-lg">{account.name}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shadow-sm">
            <Send size={24} />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard icon={<FileText className="text-blue-400" />} label="Total Cotizaciones" value={String(stats.total)} helper="Pipeline acumulado" />
        <MetricCard icon={<Send className="text-sky-400" />} label="Enviadas" value={String(stats.sent)} helper="Esperando respuesta" />
        <MetricCard icon={<FileCheck2 className="text-violet-400" />} label="Con Documento" value={String(stats.withPdf)} helper="PDFs generados" />
        <MetricCard icon={<CheckCircle2 className="text-emerald-400" />} label="Volumen Cierre" value={formatCurrency(stats.totalValue)} helper={`${stats.accepted} aceptadas`} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[350px_1fr]">
        {/* Left Column: Quote List */}
        <div className="flex flex-col h-[calc(100vh-320px)] min-h-[500px] overflow-hidden rounded-[32px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 backdrop-blur-sm shadow-sm dark:shadow-2xl">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/20">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Send size={18} className="text-blue-500 dark:text-blue-400" />
                  Bandeja Comercial
                </h3>
                <button onClick={loadQuotes} className="text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                  <Clock3 size={16} />
                </button>
              </div>

              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar cliente o servicio..."
                  className="w-full bg-slate-100 dark:bg-[#020617] border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all border ${
                    statusFilter === 'all'
                      ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/20'
                      : 'bg-slate-100 dark:bg-slate-950 text-slate-500 border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600'
                  }`}
                >
                  Todos
                </button>
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setStatusFilter(opt.value)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all border ${
                      statusFilter === opt.value
                        ? `bg-${opt.color}-600/20 text-${opt.color}-600 dark:text-${opt.color}-400 border-${opt.color}-500/50 shadow-lg`
                        : 'bg-slate-100 dark:bg-slate-950 text-slate-500 border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600'
                    }`}
                    style={{
                      backgroundColor: statusFilter === opt.value ? `rgba(var(--${opt.color}-color), 0.2)` : '',
                      color: statusFilter === opt.value ? `var(--${opt.color}-color)` : '',
                      borderColor: statusFilter === opt.value ? `var(--${opt.color}-color)` : '',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50 custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                <p className="text-sm font-medium">Sincronizando cotizaciones...</p>
              </div>
            ) : filteredQuotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-950 flex items-center justify-center text-slate-400 dark:text-slate-700 mb-4 border border-slate-200 dark:border-slate-800">
                  <Search size={32} />
                </div>
                <p className="text-slate-900 dark:text-white font-semibold">Sin resultados</p>
                <p className="text-sm text-slate-500 mt-1">No encontramos cotizaciones con estos filtros.</p>
              </div>
            ) : (
              filteredQuotes.map((quote) => (
                <button
                  key={quote.id}
                  onClick={() => setSelectedId(quote.id)}
                  className={`w-full p-6 text-left transition-all relative group ${
                    selectedId === quote.id ? 'bg-blue-600/5 dark:bg-blue-600/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                  }`}
                >
                  {selectedId === quote.id && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                  )}
                  
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                       <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter border ${statusClasses(quote.status)}`}>
                        {statusConfig(quote.status).label}
                      </span>
                      {quote.has_pdf && (
                        <FileCheck2 size={14} className="text-violet-400" />
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{formatDate(quote.created_at).split(',')[0]}</span>
                  </div>

                  <h4 className="text-slate-900 dark:text-white font-bold text-lg group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors truncate">{quote.client_name}</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{quote.phone}</p>

                  <div className="bg-slate-50 dark:bg-black/20 rounded-2xl p-4 border border-slate-200 dark:border-slate-800/50">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{quote.category || 'Servicio'}</p>
                    <p className="text-slate-700 dark:text-slate-200 text-sm font-medium truncate">{quote.product}</p>
                    <div className="mt-3 flex justify-between items-center">
                       <p className="text-emerald-600 dark:text-emerald-400 font-bold text-lg">{quote.total}</p>
                       <ChevronRight size={16} className={`text-slate-400 dark:text-slate-600 transition-transform ${selectedId === quote.id ? 'translate-x-1 text-blue-500 dark:text-blue-400' : ''}`} />
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Quote Detail */}
        <div className="flex flex-col h-[calc(100vh-320px)] min-h-[500px] overflow-hidden rounded-[32px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 backdrop-blur-sm shadow-sm dark:shadow-2xl">
          {!selectedQuote ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 p-12 text-center">
              <div className="w-24 h-24 rounded-[32px] bg-slate-100 dark:bg-slate-950 flex items-center justify-center text-slate-300 dark:text-slate-800 mb-6 border border-slate-200 dark:border-slate-800 animate-pulse">
                <FileText size={48} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Detalles de Propuesta</h3>
              <p className="max-w-md mx-auto leading-relaxed">
                Selecciona una cotización del listado lateral para ver toda la información del cliente, el documento enviado y el historial de chat.
              </p>
            </div>
          ) : (
            <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-500">
              {/* Detail Header */}
              <div className="p-8 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/20">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white shadow-xl shadow-blue-600/20">
                      <UserRound size={32} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none">{selectedQuote.client_name}</h3>
                        <div className="relative group">
                          <button 
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest border transition-all flex items-center gap-2 ${statusClasses(selectedQuote.status)} ${updatingStatus === selectedQuote.id ? 'opacity-50' : 'hover:scale-105'}`}
                            disabled={updatingStatus === selectedQuote.id}
                          >
                            {updatingStatus === selectedQuote.id ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
                            {statusConfig(selectedQuote.status).label}
                            <MoreVertical size={12} />
                          </button>
                          
                          <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                            <div className="p-3 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Cambiar Estado</div>
                            {STATUS_OPTIONS.map(opt => (
                              <button
                                key={opt.value}
                                onClick={() => handleStatusChange(selectedQuote.id, opt.value)}
                                className="w-full text-left px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2"
                              >
                                <div className={`w-2 h-2 rounded-full bg-${opt.color}-500`} />
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                        <Phone size={14} className="text-slate-300 dark:text-slate-600" /> {selectedQuote.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {selectedQuote.whatsapp_url && (
                      <a
                        href={selectedQuote.whatsapp_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-black text-slate-950 transition-all hover:bg-emerald-400 hover:scale-105 shadow-lg shadow-emerald-500/20 active:scale-95"
                      >
                        <MessageCircleMore size={18} />
                        HABLAR WHATSAPP
                      </a>
                    )}
                    <button className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-slate-600 transition-all shadow-sm">
                      <MoreVertical size={20} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Detail Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-8 space-y-8">
                  {/* Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <InfoBox 
                      icon={<UserRound size={16} className="text-blue-400" />}
                      title="Datos del Cliente"
                      items={[
                        { label: 'Nombre', value: selectedQuote.client_name },
                        { label: 'Email', value: selectedQuote.client_email || 'No registrado' },
                        { label: 'Teléfono', value: selectedQuote.phone },
                      ]}
                    />
                    <InfoBox 
                      icon={<DollarSign size={16} className="text-emerald-400" />}
                      title="Detalle Propuesta"
                      items={[
                        { label: 'Servicio', value: selectedQuote.product },
                        { label: 'Categoría', value: selectedQuote.category || 'General' },
                        { label: 'Monto Total', value: selectedQuote.total, highlight: true },
                      ]}
                    />
                    <InfoBox 
                      icon={<Calendar size={16} className="text-amber-400" />}
                      title="Trazabilidad"
                      items={[
                        { label: 'Generada', value: formatDate(selectedQuote.created_at) },
                        { label: 'Última Actividad', value: formatDate(selectedQuote.last_interaction) },
                        { label: 'ID Sistema', value: selectedQuote.id.slice(0, 8).toUpperCase() },
                      ]}
                    />
                  </div>

                  {/* Requirements & PDF Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <div className="bg-white dark:bg-[#020617] rounded-[28px] border border-slate-200 dark:border-slate-800 p-6 shadow-sm dark:shadow-none">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 rounded-xl bg-blue-600/10 text-blue-500 dark:text-blue-400">
                             <AlertCircle size={20} />
                          </div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-lg">Requerimientos Capturados</h4>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base italic bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                          "{selectedQuote.requirements || 'No se detallaron requerimientos específicos durante la conversación.'}"
                        </p>
                      </div>

                      <div className="bg-white dark:bg-[#020617] rounded-[28px] border border-slate-200 dark:border-slate-800 p-6 flex-1 shadow-sm dark:shadow-none">
                        <div className="flex items-center justify-between mb-6">
                           <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-amber-600/10 text-amber-500 dark:text-amber-400">
                               <Clock3 size={20} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">Historial Reciente</h4>
                          </div>
                          <button className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline uppercase tracking-widest">Ver Todo</button>
                        </div>
                        
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                          {selectedQuote.chat_history?.slice(-5).map((msg, idx) => (
                            <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                              <div className={`px-4 py-2.5 rounded-2xl text-sm max-w-[90%] ${
                                msg.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-none shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 rounded-tl-none border border-slate-200 dark:border-slate-700'
                              }`}>
                                {msg.message}
                              </div>
                              <span className="text-[10px] text-slate-600 mt-1">{formatDate(msg.timestamp).split(',')[1]}</span>
                            </div>
                          ))}
                          {(!selectedQuote.chat_history || selectedQuote.chat_history.length === 0) && (
                            <p className="text-slate-500 text-center py-8 text-sm italic">Sin historial disponible.</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-[#020617] rounded-[28px] border border-slate-200 dark:border-slate-800 p-1 bg-gradient-to-b from-slate-100 dark:from-slate-800/50 to-transparent shadow-sm dark:shadow-none">
                      <div className="p-7 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-violet-600/10 text-violet-500 dark:text-violet-400">
                             <FileText size={20} />
                          </div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-lg">Documento Propuesta</h4>
                        </div>
                        {pdfPreviewUrl && (
                          <a href={pdfPreviewUrl} target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-all border border-slate-200 dark:border-transparent">
                            <ExternalLink size={18} />
                          </a>
                        )}
                      </div>
                      
                      <div className="aspect-[4/5] w-full rounded-[24px] overflow-hidden bg-slate-900 border border-slate-800 relative group">
                        {pdfPreviewUrl ? (
                          <iframe
                            title={`PDF ${selectedQuote.client_name}`}
                            src={pdfPreviewUrl}
                            className="w-full h-full bg-white transition-opacity duration-500 dark:invert-[0.02] dark:hue-rotate-180"
                          />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-100/50 dark:bg-slate-900/50 backdrop-blur-sm">
                            <div className="w-20 h-20 rounded-3xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-600 mb-4 border border-slate-300 dark:border-slate-700">
                              <AlertCircle size={40} />
                            </div>
                            <h5 className="text-slate-900 dark:text-white font-bold mb-2 text-lg">PDF no disponible</h5>
                            <p className="text-sm text-slate-500 max-w-[200px]">El documento aún no ha sido generado o el proceso falló.</p>
                            <button className="mt-6 px-6 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-blue-500 transition-all">Generar ahora</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function MetricCard({ icon, label, value, helper }: { icon: React.ReactNode; label: string; value: string; helper: string }) {
  return (
    <div className="group relative overflow-hidden rounded-[32px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6 transition-all hover:border-slate-400 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/60 shadow-sm dark:shadow-xl">
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-blue-500/5 transition-transform group-hover:scale-150" />
      <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <p className="mb-1 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">{label}</p>
      <h3 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{value}</h3>
      <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
        <ChevronRight size={14} className="text-slate-300 dark:text-slate-600" />
        {helper}
      </p>
    </div>
  )
}

function InfoBox({ icon, title, items }: { icon: React.ReactNode; title: string; items: { label: string; value: string; highlight?: boolean }[] }) {
  return (
    <div className="rounded-[28px] border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#020617] p-6 hover:border-slate-400 dark:hover:border-slate-700 transition-all group shadow-sm dark:shadow-none">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-transparent group-hover:bg-slate-100 dark:group-hover:bg-slate-700 transition-colors shadow-sm dark:shadow-none">
          {icon}
        </div>
        <h4 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-widest">{title}</h4>
      </div>
      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i}>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{item.label}</p>
            <p className={`text-sm font-medium leading-relaxed ${item.highlight ? 'text-emerald-600 dark:text-emerald-400 font-bold text-lg' : 'text-slate-700 dark:text-slate-200'}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
