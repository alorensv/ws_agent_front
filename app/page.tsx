"use client"

import { useState, useEffect } from 'react'
import { LayoutDashboard, MessageSquare, Quote, Package, Settings, Bell, Search, User, TrendingUp, Users, Clock, X } from 'lucide-react'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [quotes, setQuotes] = useState<any[]>([])
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedChat, setSelectedChat] = useState<any | null>(null)
  const [kpis, setKpis] = useState({
    cotizaciones_hoy: '0',
    nuevos_leads: '0',
    tiempo_respuesta: '0s',
    conversion: '0%'
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const url = process.env.NEXT_PUBLIC_API_URL
        const [qRes, cRes, kRes] = await Promise.all([
          fetch(`${url}/quotes/recent`),
          fetch(`${url}/conversations`),
          fetch(`${url}/dashboard/kpis`)
        ])
        const qData = await qRes.json()
        const cData = await cRes.json()
        const kData = await kRes.json()
        if (Array.isArray(qData)) setQuotes(qData)
        if (Array.isArray(cData)) setConversations(cData)
        if (kData && kData.cotizaciones_hoy !== undefined) {
          setKpis({
            cotizaciones_hoy: String(kData.cotizaciones_hoy),
            nuevos_leads: String(kData.nuevos_leads),
            tiempo_respuesta: String(kData.tiempo_respuesta),
            conversion: String(kData.conversion)
          })
        }
      } catch (error) {
        console.error("Error fetching data", error)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-[#020617] flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            ChatCotizador
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem icon={<LayoutDashboard size={20}/>} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavItem icon={<MessageSquare size={20}/>} label="Conversaciones" active={activeTab === 'conversations'} onClick={() => setActiveTab('conversations')} />
          <NavItem icon={<Quote size={20}/>} label="Cotizaciones" />
          <NavItem icon={<Package size={20}/>} label="Productos" />
        </nav>

        <div className="p-4 border-top border-slate-800">
          <NavItem icon={<Settings size={20}/>} label="Configuración" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-[#020617]/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800 w-96">
            <Search size={18} className="text-slate-400" />
            <input type="text" placeholder="Buscar..." className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-full" />
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-slate-400 hover:text-white transition-colors">
              <Bell size={20} />
            </button>
            <div className="flex items-center space-x-3 pl-4 border-l border-slate-800">
              <div className="text-right">
                <p className="text-xs font-semibold text-white">Alejandro Lorens</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Administrador</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center font-bold text-sm text-white border border-slate-700 shadow-lg shadow-blue-500/20">
                AL
              </div>
            </div>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="p-8">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Panel de Control</h2>
                <p className="text-slate-400">Resumen de actividad y cotizaciones generadas hoy.</p>
              </div>
              <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-600/20">
                Descargar Reporte
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard icon={<TrendingUp className="text-emerald-400" />} label="Cotizaciones Hoy" value={kpis.cotizaciones_hoy} change="+Hoy" />
              <StatCard icon={<Users className="text-blue-400" />} label="Nuevos Leads" value={kpis.nuevos_leads} change="+Hoy" />
              <StatCard icon={<Clock className="text-amber-400" />} label="Tiempo Respuesta" value={kpis.tiempo_respuesta} change="Avg" />
              <StatCard icon={<Quote className="text-purple-400" />} label="Conversión" value={kpis.conversion} change="+Est." />
            </div>

            {/* Table Grouped by Client */}
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden backdrop-blur-sm">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <h3 className="font-semibold text-white">Llamadas y Clientes Recientes (Agrupados)</h3>
                <button className="text-blue-400 text-sm hover:underline font-medium" onClick={() => setActiveTab('conversations')}>Ver todos los leads</button>
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800/50">
                    <th className="px-6 py-4 font-semibold">Cliente</th>
                    <th className="px-6 py-4 font-semibold">Último Servicio</th>
                    <th className="px-6 py-4 font-semibold">Nº Cot.</th>
                    <th className="px-6 py-4 font-semibold">Última Fecha</th>
                    <th className="px-6 py-4 font-semibold">Total Acumulado</th>
                    <th className="px-6 py-4 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {Object.values(quotes.reduce((acc: any, q) => {
                    if (!acc[q.phone]) {
                      acc[q.phone] = { 
                        ...q, 
                        count: 1, 
                        total_amount: parseFloat(q.total?.replace('$', '').replace(',', '') || '0'),
                        all_items: [q]
                      }
                    } else {
                      acc[q.phone].count += 1
                      acc[q.phone].total_amount += parseFloat(q.total?.replace('$', '').replace(',', '') || '0')
                      acc[q.phone].all_items.push(q)
                      // Keep latest date/status
                      if (new Date(q.date) > new Date(acc[q.phone].date)) {
                        acc[q.phone].date = q.date
                        acc[q.phone].product = q.product
                        acc[q.phone].status = q.status
                        acc[q.phone].total = q.total
                      }
                    }
                    return acc
                  }, {})).map((group: any) => (
                    <tr key={group.phone} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs border border-slate-700">
                            {group.phone?.slice(-2) || '--'}
                          </div>
                          <span className="text-sm font-medium text-white">{group.phone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        <div className="flex flex-col">
                          <span>{group.product}</span>
                          <span className="text-[10px] text-slate-500 italic">{group.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-500/10 text-blue-400 text-xs px-2 py-0.5 rounded-md border border-blue-500/20">
                          {group.count}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">{new Date(group.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-emerald-400">${group.total_amount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-3">
                          <button className="text-slate-500 hover:text-white transition-colors" title="Ver Historial" onClick={() => setSelectedChat({
                            ...group,
                            chat_history: group.all_items.flatMap((i: any) => i.chat_history || [])
                          })}>
                            <Clock size={16} />
                          </button>
                          <button className="text-blue-400 hover:text-white transition-colors p-1.5 bg-blue-500/10 rounded-lg" title="Analizar Lead" onClick={() => {
                            setActiveTab('conversations')
                            // Logic could be added here to auto-select or filter the conversation
                          }}>
                            <Search size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {quotes.length === 0 && (
                     <tr>
                        <td colSpan={6} className="px-6 py-10 text-center text-slate-500 text-sm">No hay cotizaciones registradas aún.</td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'conversations' && (
          <div className="p-8">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Todas las Conversaciones</h2>
                <p className="text-slate-400">Historial completo de interacciones de los clientes.</p>
              </div>
            </div>
            
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden backdrop-blur-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800/50">
                    <th className="px-6 py-4 font-semibold">Cliente (WhatsApp)</th>
                    <th className="px-6 py-4 font-semibold">Nombre Registrado</th>
                    <th className="px-6 py-4 font-semibold">Última Interacción</th>
                    <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {conversations.map((conv) => (
                    <tr key={conv.id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs border border-slate-700">
                            {conv.phone_number?.slice(-2) || '--'}
                          </div>
                          <span className="text-sm font-medium text-white">{conv.phone_number}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">{conv.full_name || 'Desconocido'}</td>
                      <td className="px-6 py-4 text-sm text-slate-400">{new Date(conv.last_interaction).toLocaleString()}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 hover:bg-blue-500/20 px-4 py-2 rounded-lg text-xs font-semibold" onClick={() => setSelectedChat({
                          phone: conv.phone_number,
                          product: 'Historial General',
                          total: '-',
                          chat_history: conv.chat_history
                        })}>
                          Ver Chat
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modal Detalles Conversación */}
      {selectedChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg h-[600px] rounded-2xl flex flex-col shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-[#020617]">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Quote size={18} className="text-blue-400" /> Conversación: {selectedChat.phone}
              </h3>
              <button className="text-slate-400 hover:text-white transition-colors" onClick={() => setSelectedChat(null)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 bg-slate-800/30 border-b border-slate-800 text-sm">
               <span className="text-slate-400 block mb-1">Producto Consultado:</span>
               <span className="text-white font-medium bg-slate-800 px-3 py-1 rounded-md">{selectedChat.product}</span>
               <span className="text-emerald-400 font-bold ml-4">{selectedChat.total}</span>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {selectedChat.chat_history?.map((msg: any, i: number) => (
                <div key={i} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <span className={`text-[10px] text-slate-500 mb-1 uppercase tracking-wider font-semibold`}>{msg.sender === 'user' ? 'Cliente' : 'Agente IA'}</span>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                    msg.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                  }`}>
                    {msg.message}
                  </div>
                  <span className="text-[9px] text-slate-600 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
              {(!selectedChat.chat_history || selectedChat.chat_history.length === 0) && (
                <div className="text-center text-slate-500 text-sm mt-10">No hay historial de chat disponible.</div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <div onClick={onClick} className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all ${
      active ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20 shadow-[0_0_15px_-3px_rgba(37,99,235,0.1)]' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
    }`}>
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </div>
  )
}

function StatCard({ icon, label, value, change }: { icon: React.ReactNode, label: string, value: string, change: string }) {
  return (
    <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all group backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-slate-800 rounded-lg group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
          change.startsWith('+') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
        }`}>
          {change}
        </span>
      </div>
      <p className="text-slate-400 text-xs font-medium mb-1 uppercase tracking-wider">{label}</p>
      <h4 className="text-2xl font-bold text-white">{value}</h4>
    </div>
  )
}
