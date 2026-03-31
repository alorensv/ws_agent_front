"use client";

import React from "react";
import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen p-8 md:p-24 bg-slate-950 text-slate-200">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <header className="border-b border-slate-800 pb-8 space-y-4">
          <Link 
            href="/" 
            className="text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-2 mb-4"
          >
            ← Volver al Panel
          </Link>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Política de Privacidad
          </h1>
          <p className="text-slate-400">
            Última actualización: 31 de marzo de 2026
          </p>
        </header>

        {/* Content Section with Glassmorphism */}
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-8 space-y-8 leading-relaxed shadow-xl">
          
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">1. Introducción</h2>
            <p>
              Esta Política de Privacidad describe cómo el sistema <strong>ChatCotizador Agent</strong> recopila, usa y protege la información obtenida a través de la API oficial de WhatsApp Cloud de Meta. Nos comprometemos a garantizar que su privacidad esté protegida.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">2. Información que Recopilamos</h2>
            <p>
              Al interactuar con nuestro agente de WhatsApp, recopilamos los siguientes datos necesarios para la funcionalidad del servicio:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-300">
              <li>Número de teléfono vinculado a la cuenta de WhatsApp del usuario.</li>
              <li>Nombre de perfil público proporcionado por la plataforma WhatsApp.</li>
              <li>Contenido de los mensajes de texto, imágenes o documentos enviados al agente.</li>
              <li>Historial de cotizaciones generadas.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">3. Procesamiento mediante IA</h2>
            <p>
              Nuestro sistema utiliza modelos de Inteligencia Artificial para interpretar sus solicitudes y generar respuestas coherentes.
            </p>
            <p className="bg-blue-900/20 border-l-4 border-blue-500 p-4 italic text-slate-300">
              "Los datos enviados a los proveedores de IA se utilizan exclusivamente para procesar la respuesta inmediata del agente y no para el entrenamiento de modelos globales de terceros."
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">4. Uso de la Información</h2>
            <p>
              Utilizamos la información recopilada para:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-300">
              <li>Procesar y generar cotizaciones automáticas.</li>
              <li>Brindar soporte al cliente y responder consultas técnicas.</li>
              <li>Gestionar el historial de conversaciones comerciales.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">5. Compartición de Datos</h2>
            <p>
              No compartimos sus datos personales con terceros, excepto con:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-300">
              <li><strong>Meta Platforms, Inc.</strong>: A través de quien operamos el canal de comunicación.</li>
              <li><strong>Proveedores de Infraestructura</strong>: Supabase y Vercel para el alojamiento técnico del sistema.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">6. Seguridad y Almacenamiento</h2>
            <p>
              Todos los datos se almacenan en servidores de alta seguridad mediante cifrado y protocolos de acceso restringido. Retenemos la información solo por el tiempo necesario para cumplir con los fines comerciales descritos.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">7. Sus Derechos</h2>
            <p>
              Usted tiene derecho a solicitar el acceso, rectificación o eliminación total de sus datos de nuestro sistema en cualquier momento enviando un mensaje directamente a nuestro canal de WhatsApp con la palabra <strong>"ELIMINAR"</strong> o contactando al administrador.
            </p>
          </section>

        </div>

        {/* Footer info */}
        <footer className="text-center text-slate-500 text-sm py-8 border-t border-slate-900 mt-12">
          &copy; 2026 ChatCotizador Agent. Desarrollado para el cumplimiento de las políticas de uso de WhatsApp Cloud API.
        </footer>
      </div>
    </main>
  );
}
