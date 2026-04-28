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
}

const STATUS_OPTIONS = ['all', 'sent', 'accepted', 'pending_validation', 'pdf_generated', 'pdf_failed_delivery']

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

function formatStatus(status?: string) {
  const normalized = (status || 'pending').toLowerCase()
  const labels: Record<string, string> = {
    sent: 'Enviada',
    accepted: 'Aceptada',
    pending_validation: 'Pendiente validacion',
    pdf_generated: 'PDF listo',
    pdf_failed_delivery: 'Entrega fallida',
    draft: 'Borrador',
    pending: 'Pendiente',
  }

  return labels[normalized] || normalized.replace(/_/g, ' ')
}

function statusClasses(status?: string) {
  const normalized = (status || 'pending').toLowerCase()
  if (normalized === 'accepted') return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
  if (normalized === 'sent') return 'border-sky-500/20 bg-sky-500/10 text-sky-300'
  if (normalized === 'pdf_generated') return 'border-violet-500/20 bg-violet-500/10 text-violet-300'
  if (normalized === 'pdf_failed_delivery') return 'border-rose-500/20 bg-rose-500/10 text-rose-300'
  return 'border-amber-500/20 bg-amber-500/10 text-amber-300'
}

export function QuotesPanel({ account }: QuotesPanelProps) {
  const [quotes, setQuotes] = useState<QuoteItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    async function loadQuotes() {
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
        setSelectedId((current) => current && nextQuotes.some((quote) => quote.id === current) ? current : nextQuotes[0]?.id || null)
      } catch (err: any) {
        setError(err.message || 'No fue posible cargar las cotizaciones.')
      } finally {
        setLoading(false)
      }
    }

    loadQuotes()
  }, [account?.id])

  const filteredQuotes = useMemo(() => {
    return quotes.filter((quote) => {
      const text = `${quote.client_name} ${quote.phone} ${quote.product} ${quote.requirements}`.toLowerCase()
      const matchesSearch = !search || text.includes(search.toLowerCase())
      const matchesStatus = statusFilter === 'all' || quote.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [quotes, search, statusFilter])

  useEffect(() => {
    if (!selectedId && filteredQuotes[0]) {
      setSelectedId(filteredQuotes[0].id)
      return
    }

    if (selectedId && !filteredQuotes.some((quote) => quote.id === selectedId)) {
      setSelectedId(filteredQuotes[0]?.id || null)
    }
  }, [filteredQuotes, selectedId])

  const selectedQuote = filteredQuotes.find((quote) => quote.id === selectedId) || filteredQuotes[0] || null

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
        <div className="rounded-[28px] border border-slate-800 bg-slate-900/40 p-8">
          <p className="mb-3 text-sm uppercase tracking-[0.25em] text-slate-500">Cotizaciones</p>
          <h2 className="mb-3 text-3xl font-bold text-white">Selecciona una cuenta para revisar su pipeline comercial</h2>
          <p className="max-w-2xl leading-relaxed text-slate-400">
            El modulo trabaja por cuenta activa. Cuando elijas una en el selector superior, cargaremos sus cotizaciones,
            clientes, historial y el PDF enviado a cada lead.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-8 p-8">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="mb-3 text-sm uppercase tracking-[0.25em] text-slate-500">Cotizaciones</p>
          <h2 className="mb-2 text-3xl font-bold text-white">Cierra oportunidades con contexto completo</h2>
          <p className="max-w-3xl leading-relaxed text-slate-400">
            Visualiza el PDF enviado, los datos del cliente y toda la conversacion asociada para tomar contacto con
            rapidez y cerrar la venta desde una sola vista.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-2 text-sm text-slate-300">
            <span className="text-slate-500">Cuenta:</span> {account.name}
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-2 text-sm text-slate-300">
            <span className="text-slate-500">Rol:</span> {account.role || 'admin'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Cotizaciones" value={String(stats.total)} helper="Pipeline de esta cuenta" />
        <MetricCard label="Enviadas" value={String(stats.sent)} helper="Listas para seguimiento" />
        <MetricCard label="Con PDF" value={String(stats.withPdf)} helper="Soporte visible al ejecutivo" />
        <MetricCard label="Monto total" value={formatCurrency(stats.totalValue)} helper={`${stats.accepted} aceptadas`} />
      </div>

      <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(360px,0.8fr)_minmax(0,1.2fr)]">
        <div className="overflow-hidden rounded-[28px] border border-slate-800 bg-slate-900/40">
          <div className="border-b border-slate-800 px-6 py-5">
            <div className="flex flex-col gap-4">
              <div>
                <div className="flex items-center gap-2 font-semibold text-white">
                  <Send size={18} className="text-sky-400" />
                  Bandeja comercial
                </div>
                <p className="mt-1 text-sm text-slate-400">
                  Prioriza a quien contactar con lectura rapida de cliente, servicio y estado.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center rounded-2xl border border-slate-800 bg-[#020617] px-3 py-2 text-sm text-slate-300">
                  <Search size={16} className="mr-2 text-slate-500" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por cliente, telefono, servicio o requerimiento"
                    className="w-full bg-transparent outline-none placeholder:text-slate-500"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setStatusFilter(option)}
                      className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                        statusFilter === option
                          ? 'border-sky-500/40 bg-sky-500/15 text-sky-200'
                          : 'border-slate-700 bg-slate-950 text-slate-400 hover:border-slate-600 hover:text-white'
                      }`}
                    >
                      {option === 'all' ? 'Todos' : formatStatus(option)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center px-6 py-20 text-slate-400">
              <Loader2 className="mr-3 h-5 w-5 animate-spin" />
              Cargando cotizaciones...
            </div>
          ) : error ? (
            <div className="px-6 py-16 text-center text-sm text-rose-300">{error}</div>
          ) : filteredQuotes.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-800 bg-slate-950 text-slate-500">
                <FileText size={22} />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">No hay cotizaciones para este filtro</h3>
              <p className="mx-auto max-w-lg text-sm leading-6 text-slate-400">
                Cuando el bot genere propuestas para esta cuenta, las veras aqui con cliente, historial y PDF.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {filteredQuotes.map((quote) => (
                <button
                  key={quote.id}
                  type="button"
                  onClick={() => setSelectedId(quote.id)}
                  className={`w-full px-6 py-5 text-left transition-colors hover:bg-slate-800/30 ${
                    selectedQuote?.id === quote.id ? 'bg-sky-500/10' : ''
                  }`}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusClasses(quote.status)}`}>
                            {formatStatus(quote.status)}
                          </span>
                          {quote.has_pdf && (
                            <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-[11px] text-violet-200">
                              PDF listo
                            </span>
                          )}
                        </div>
                        <h3 className="truncate text-lg font-semibold text-white">{quote.client_name}</h3>
                        <p className="mt-1 truncate text-sm text-slate-400">{quote.phone}</p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-slate-500">{formatDate(quote.created_at)}</p>
                        <p className="mt-2 text-lg font-semibold text-emerald-300">{quote.total}</p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{quote.category || 'Servicio'}</p>
                      <p className="mt-1 font-medium text-slate-100">{quote.product}</p>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">
                        {quote.requirements || quote.product_description || 'Sin requerimientos registrados.'}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="overflow-hidden rounded-[28px] border border-slate-800 bg-slate-900/40">
            <div className="border-b border-slate-800 px-6 py-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <div className="flex items-center gap-2 font-semibold text-white">
                    <UserRound size={18} className="text-emerald-400" />
                    Ficha de cierre
                  </div>
                  <p className="mt-1 text-sm text-slate-400">
                    Cliente, propuesta, canales de contacto y lectura del PDF en el mismo lugar.
                  </p>
                </div>

                {selectedQuote && (
                  <div className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-medium ${statusClasses(selectedQuote.status)}`}>
                    {formatStatus(selectedQuote.status)}
                  </div>
                )}
              </div>
            </div>

            {!selectedQuote ? (
              <div className="px-6 py-16 text-center text-slate-500">Selecciona una cotizacion para ver su detalle.</div>
            ) : (
              <div className="space-y-6 px-6 py-6">
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                  <InfoCard
                    title="Cliente"
                    lines={[
                      selectedQuote.client_name,
                      selectedQuote.phone,
                      selectedQuote.client_email || 'Sin email registrado',
                      selectedQuote.last_interaction ? `Ultima interaccion: ${formatDate(selectedQuote.last_interaction)}` : 'Sin ultima interaccion',
                    ]}
                  />
                  <InfoCard
                    title="Cotizacion"
                    lines={[
                      selectedQuote.product,
                      selectedQuote.category || 'Categoria sin definir',
                      selectedQuote.total,
                      `Creada: ${formatDate(selectedQuote.created_at)}`,
                    ]}
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  {selectedQuote.whatsapp_url && (
                    <a
                      href={selectedQuote.whatsapp_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-slate-950 transition-colors hover:bg-emerald-400"
                    >
                      <MessageCircleMore size={16} />
                      Hablar por WhatsApp
                    </a>
                  )}

                  {selectedQuote.phone_digits && (
                    <a
                      href={`tel:${selectedQuote.phone_digits}`}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-200 transition-colors hover:border-slate-500 hover:text-white"
                    >
                      <Phone size={16} />
                      Llamar
                    </a>
                  )}

                  {selectedQuote.client_email && (
                    <a
                      href={`mailto:${selectedQuote.client_email}`}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-200 transition-colors hover:border-slate-500 hover:text-white"
                    >
                      <Mail size={16} />
                      Enviar email
                    </a>
                  )}

                  {pdfPreviewUrl && (
                    <a
                      href={pdfPreviewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-2xl border border-violet-500/30 bg-violet-500/10 px-4 py-2.5 text-sm text-violet-100 transition-colors hover:bg-violet-500/20"
                    >
                      <ExternalLink size={16} />
                      Abrir PDF
                    </a>
                  )}
                </div>

                <div className="rounded-[24px] border border-slate-800 bg-slate-950/70 p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Requerimiento capturado</p>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    {selectedQuote.requirements || 'No se guardaron requerimientos adicionales para esta cotizacion.'}
                  </p>
                </div>

                <div className="rounded-[24px] border border-slate-800 bg-slate-950/70 p-4">
                  <div className="mb-4 flex items-center gap-2 font-medium text-white">
                    <FileText size={17} className="text-violet-300" />
                    PDF enviado al cliente
                  </div>

                  {pdfPreviewUrl ? (
                    <iframe
                      title={`PDF de ${selectedQuote.client_name}`}
                      src={pdfPreviewUrl}
                      className="h-[420px] w-full rounded-2xl border border-slate-800 bg-white"
                    />
                  ) : (
                    <div className="flex h-[220px] items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-950 text-sm text-slate-500">
                      Esta cotizacion aun no tiene PDF disponible.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-[28px] border border-slate-800 bg-slate-900/40">
            <div className="border-b border-slate-800 px-6 py-5">
              <div className="flex items-center gap-2 font-semibold text-white">
                <Clock3 size={18} className="text-amber-300" />
                Historial asociado
              </div>
              <p className="mt-1 text-sm text-slate-400">Contexto conversacional para personalizar el seguimiento.</p>
            </div>

            <div className="max-h-[420px] space-y-4 overflow-y-auto px-6 py-6">
              {selectedQuote?.chat_history?.length ? (
                selectedQuote.chat_history.map((msg, index) => {
                  const isClient = msg.sender === 'user'

                  return (
                    <div key={`${msg.timestamp || 'msg'}-${index}`} className={`flex flex-col ${isClient ? 'items-end' : 'items-start'}`}>
                      <span className="mb-1 text-[10px] uppercase tracking-[0.2em] text-slate-500">
                        {isClient ? 'Cliente' : 'Agente IA'}
                      </span>
                      <div
                        className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                          isClient
                            ? 'bg-sky-500 text-white rounded-tr-sm'
                            : 'border border-slate-700 bg-slate-950 text-slate-200 rounded-tl-sm'
                        }`}
                      >
                        {msg.message || 'Mensaje sin contenido'}
                      </div>
                      <span className="mt-1 text-[10px] text-slate-600">{formatDate(msg.timestamp)}</span>
                    </div>
                  )
                })
              ) : (
                <div className="text-center text-sm text-slate-500">No hay historial asociado para esta cotizacion.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function MetricCard({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="rounded-[24px] border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
      <p className="mb-2 text-xs uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <h3 className="text-2xl font-bold text-white">{value}</h3>
      <p className="mt-2 text-sm text-slate-400">{helper}</p>
    </div>
  )
}

function InfoCard({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="rounded-[22px] border border-slate-800 bg-slate-950/70 p-5">
      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{title}</p>
      <div className="mt-3 space-y-2 text-sm text-slate-300">
        {lines.map((line) => (
          <p key={`${title}-${line}`}>{line}</p>
        ))}
      </div>
    </div>
  )
}
