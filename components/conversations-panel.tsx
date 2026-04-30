"use client"

import React, { useState, useEffect } from 'react'
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  ExternalLink, 
  MessageCircle, 
  Clock, 
  ChevronRight, 
  Smartphone,
  Mail,
  Loader2,
  X,
  Phone
} from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface ChatMessage {
  sender: 'user' | 'bot'
  message: string
  timestamp: string
}

interface Conversation {
  id: string
  phone_number: string
  full_name: string | null
  email?: string | null
  last_interaction: string
  chat_history: ChatMessage[]
  session_state: any
}

interface ConversationsPanelProps {
  account: {
    id: string
    name: string
    role: string
  } | null
}

export function ConversationsPanel({ account }: ConversationsPanelProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadConversations = async () => {
    if (!account?.id) return
    setLoading(true)
    setError(null)
    try {
      const url = process.env.NEXT_PUBLIC_API_URL
      const res = await fetch(`${url}/conversations?account_id=${account.id}`)
      if (!res.ok) throw new Error('Error al cargar conversaciones')
      const data = await res.json()
      setConversations(data)
      if (data.length > 0 && !selectedId) {
        setSelectedId(data[0].id)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConversations()
  }, [account?.id])

  const filteredConversations = conversations.filter(c => 
    c.phone_number.includes(search) || 
    (c.full_name && c.full_name.toLowerCase().includes(search.toLowerCase()))
  )

  const selectedConversation = conversations.find(c => c.id === selectedId)

  const getWhatsAppLink = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '')
    return `https://wa.me/${cleanPhone}`
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden animate-in fade-in duration-500 bg-slate-50 dark:bg-transparent transition-colors duration-300">
      {/* Sidebar - Conversation List */}
      <div className="w-[350px] border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-[#020617]/50 backdrop-blur-sm">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <MessageSquare size={20} className="text-blue-500 dark:text-blue-400" />
            Conversaciones
          </h2>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Buscar cliente o teléfono..."
              className="w-full bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-500 dark:placeholder:text-slate-600"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading && (
            <div className="flex flex-col items-center justify-center p-12 text-slate-500">
              <Loader2 className="animate-spin mb-2" />
              <p className="text-xs">Cargando leads...</p>
            </div>
          )}

          {!loading && filteredConversations.length === 0 && (
            <div className="p-8 text-center">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400 dark:text-slate-600">
                <MessageSquare size={24} />
              </div>
              <p className="text-sm text-slate-500">No se encontraron conversaciones.</p>
            </div>
          )}

          {filteredConversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedId(conv.id)}
              className={cn(
                "w-full p-4 border-b border-slate-100 dark:border-slate-800/50 flex gap-4 text-left transition-all hover:bg-slate-50 dark:hover:bg-slate-800/30 relative group",
                selectedId === conv.id && "bg-blue-600/5 dark:bg-blue-600/10"
              )}
            >
              {selectedId === conv.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
              )}
              
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0 text-slate-500 dark:text-slate-400 group-hover:scale-105 transition-transform">
                <User size={20} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                    {conv.full_name || 'Nuevo Prospecto'}
                  </h3>
                  <span className="text-[10px] text-slate-500 whitespace-nowrap">
                    {new Date(conv.last_interaction).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                  <Smartphone size={10} className="text-slate-400 dark:text-slate-500" />
                  {conv.phone_number}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    {conv.chat_history.length} msgs
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content - Chat Detail */}
      <div className="flex-1 flex flex-col bg-[#020617]/20 backdrop-blur-xl relative">
        {!selectedConversation ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 bg-slate-50/50 dark:bg-transparent">
            <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 text-blue-500 dark:text-blue-400 animate-pulse">
              <MessageCircle size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Selecciona una conversación</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-xs text-center">
              Revisa el historial de interacciones de tus clientes capturados por la IA.
            </p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <header className="h-20 border-b border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between bg-white dark:bg-slate-900/40 backdrop-blur-md sticky top-0 z-10 shadow-sm dark:shadow-none">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/5">
                  <User size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                    {selectedConversation.full_name || 'Nuevo Prospecto'}
                  </h2>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Smartphone size={12} className="text-slate-400 dark:text-slate-500" />
                      {selectedConversation.phone_number}
                    </span>
                    {selectedConversation.email && (
                      <span className="flex items-center gap-1">
                        <Mail size={12} className="text-slate-400 dark:text-slate-500" />
                        {selectedConversation.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <a 
                  href={getWhatsAppLink(selectedConversation.phone_number)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2 hover:scale-105 active:scale-95"
                >
                  <MessageCircle size={18} />
                  Continuar en WhatsApp
                </a>
                <button className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors shadow-sm">
                  <Phone size={18} />
                </button>
              </div>
            </header>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-slate-50/30 dark:bg-transparent">
              <div className="flex justify-center mb-8">
                <div className="bg-white dark:bg-slate-800/50 backdrop-blur-md px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-700/50 text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold flex items-center gap-2 shadow-sm">
                  <Clock size={12} />
                  Inicio de la conversación: {new Date(selectedConversation.last_interaction).toLocaleDateString()}
                </div>
              </div>

              {selectedConversation.chat_history.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={cn(
                    "flex flex-col max-w-[70%] animate-in fade-in slide-in-from-bottom-4 duration-300",
                    msg.sender === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className={cn(
                    "mb-1 px-2 text-[10px] font-bold uppercase tracking-wider",
                    msg.sender === 'user' ? "text-blue-600 dark:text-blue-400" : "text-emerald-600 dark:text-emerald-400"
                  )}>
                    {msg.sender === 'user' ? 'Cliente' : 'Asistente IA'}
                  </div>
                  
                  <div className={cn(
                    "px-5 py-3.5 rounded-3xl text-sm leading-relaxed shadow-lg",
                    msg.sender === 'user' 
                      ? "bg-blue-600 text-white rounded-tr-none shadow-blue-500/10 border border-blue-400/20" 
                      : "bg-white dark:bg-slate-800/80 backdrop-blur-md text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-black/20"
                  )}>
                    {msg.message}
                  </div>
                  
                  <span className="mt-1.5 px-2 text-[9px] text-slate-500 font-medium">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}

              {selectedConversation.chat_history.length === 0 && (
                <div className="flex flex-col items-center justify-center p-20 text-slate-600">
                   <Clock size={40} className="mb-4 opacity-20" />
                   <p>No hay mensajes registrados.</p>
                </div>
              )}
            </div>

            {/* Footer Status Bar */}
            <footer className="p-4 bg-white dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 backdrop-blur-md">
              <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 px-4">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Agente IA Activo
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Filter size={12} />
                    Filtrado por: {account?.name}
                  </span>
                </div>
                <div className="font-mono opacity-50">
                  REF_ID: {selectedConversation.id.slice(0, 8)}
                </div>
              </div>
            </footer>
          </>
        )}
      </div>
    </div>
  )
}
