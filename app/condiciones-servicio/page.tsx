"use client";

import React from "react";
import Link from "next/link";

export default function TermsOfService() {
  return (
    <main className="min-h-screen p-8 md:p-24 bg-slate-950 text-slate-200">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <header className="border-b border-slate-800 pb-8 space-y-4 text-center">
          <Link 
            href="/" 
            className="text-blue-400 hover:text-blue-300 transition-colors inline-block mb-4"
          >
            ← Volver al Panel
          </Link>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Condiciones del Servicio
          </h1>
          <p className="text-slate-400">
            Vigente desde: 31 de marzo de 2026
          </p>
        </header>

        {/* Content Section with Premium Glass Card */}
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-8 space-y-10 leading-relaxed shadow-2xl">
          
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <span className="text-blue-500">01.</span> Aceptación de los Términos
            </h2>
            <p>
              Al interactuar con nuestro agente de WhatsApp ("ChatCotizador Agent"), usted acepta plenamente estas condiciones. Si no está de acuerdo, por favor desista de utilizar el servicio de inmediato.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <span className="text-blue-500">02.</span> Naturaleza del Servicio (IA)
            </h2>
            <p>
              Usted comprende que está interactuando con un sistema de <strong>Inteligencia Artificial</strong> automatizado. Aunque nos esforzamos por la máxima precisión en nuestras cotizaciones y respuestas:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-300 bg-red-900/10 p-4 rounded-lg border border-red-900/20">
              <li>Las respuestas son generadas algorítmicamente y pueden contener errores.</li>
              <li>Las cotizaciones proporcionadas son <strong>estimaciones referenciales</strong> y no constituyen un contrato final sin validación humana.</li>
              <li>El sistema puede no estar disponible durante el mantenimiento o fallos en los servidores de Meta/WhatsApp.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <span className="text-blue-500">03.</span> Uso Permitido
            </h2>
            <p>
              El usuario se compromete a:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-300">
              <li>No enviar contenido ilegal, ofensivo o spam al agente.</li>
              <li>No intentar vulnerar el sistema mediante inyección de prompts (jailbreak) o ataques técnicos.</li>
              <li>Ser mayor de edad conforme a las leyes de su localidad.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <span className="text-blue-500">04.</span> Límites de Responsabilidad
            </h2>
            <p>
              ChatCotizador Agent no será responsable de daños directos, indirectos o incidentales resultantes del uso del chatbot de IA. La responsabilidad máxima se limita al alcance de las leyes de privacidad vigentes.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <span className="text-blue-500">05.</span> Cambios en los Precios y Productos
            </h2>
            <p>
              Toda la información de precios y stock proporcionada por el agente está sujeta a cambios sin previo aviso, dependiendo de la actualización de nuestra base de datos central.
            </p>
          </section>

          <div className="bg-blue-600/10 p-6 rounded-xl border border-blue-500/30 text-center">
            <p className="text-slate-300">
              Cualquier duda adicional puede ser consultada en nuestra <Link href="/politica-privacidad" className="text-blue-400 underline underline-offset-4 font-bold hover:text-blue-300 transition-colors">Política de Privacidad</Link>.
            </p>
          </div>

        </div>

        {/* Footer legal */}
        <footer className="text-center text-slate-600 text-sm py-12">
          &copy; 2026 ChatCotizador Agent. Términos adaptados a las políticas de Meta y normativas de comercio electrónico locales.
        </footer>
      </div>
    </main>
  );
}
