"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface PlanFeature {
  codigo?: string;
  nombre: string;
  descripcion?: string;
}

interface Plan {
  id?: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  precio: number | null;
  moneda?: string;
  periodo: string | null;
  features: Array<PlanFeature | string>;
}

interface PricingSectionProps {
  onOpenB2BModal: () => void;
}

// Datos de fallback en caso de que falle la API
const fallbackB2C: Plan[] = [
  { id: 1, codigo: "B2C_FREE", nombre: "Free", descripcion: "Prueba 7 días $0 (trial)", precio: 0, moneda: "ARS", periodo: null, features: ["Probá la plataforma y configurá tu evento", "Cargá invitados manualmente", "Acceso a módulos básicos para testear"] },
  { id: 2, codigo: "B2C_BASIC", nombre: "Basic", descripcion: "Evento ordenado", precio: 15000, moneda: "ARS", periodo: "evento", features: ["Plantillas + configuración completa", "Invitaciones y confirmaciones (RSVP)", "Logística del evento"] },
  { id: 3, codigo: "B2C_PLUS", nombre: "Plus", descripcion: "Interacción + recuerdos", precio: 25000, moneda: "ARS", periodo: "evento", features: ["Todo lo de Basic", "Álbum colaborativo / recuerdos", "Encuestas/votaciones pre-evento"] },
  { id: 4, codigo: "B2C_PRO", nombre: "Pro", descripcion: "Premium completo", precio: 45000, moneda: "ARS", periodo: "evento", features: ["Todo lo de Plus", "Módulos live (votaciones en vivo)", "Control avanzado (check-in, QR)"] },
];

const fallbackB2B: Plan[] = [
  { id: 5, codigo: "B2B_STARTER", nombre: "Starter", descripcion: "Operación base", precio: 30000, moneda: "ARS", periodo: "mes", features: ["Gestión de múltiples eventos", "Plantillas y flujos para equipos", "Soporte y operación básica"] },
  { id: 6, codigo: "B2B_TEAM", nombre: "Team", descripcion: "Equipo + módulos premium", precio: 60000, moneda: "ARS", periodo: "mes", features: ["Usuarios de staff", "Módulos premium incluidos", "Reportes operativos"] },
  { id: 7, codigo: "B2B_PREMIUM", nombre: "Premium", descripcion: "Marca blanca + full", precio: 100000, moneda: "ARS", periodo: "mes", features: ["Branding / marca blanca", "Dominio personalizado", "Analítica y reportes avanzados"] },
];

export default function PricingSection({ onOpenB2BModal }: PricingSectionProps) {
  const [isB2C, setIsB2C] = useState(true);
  const [b2cPlans, setB2cPlans] = useState<Plan[]>(fallbackB2C);
  const [b2bPlans, setB2bPlans] = useState<Plan[]>(fallbackB2B);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/planesPublic/PublicCatalog?mercado=AR&moneda=ARS&tipo=${isB2C ? 'B2C' : 'B2B'}`);
        if (res.ok) {
          const data = await res.json();
          // Solo si data tiene elementos reemplazamos el fallback (para evitar UI vacías si la DB está vacía temporalmente)
          if (data && data.length > 0) {
              isB2C ? setB2cPlans(data) : setB2bPlans(data);
          }
        } else {
           console.warn("Fallback: backend returned", res.status);
        }
      } catch (error) {
        console.error("Error fetching plans:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, [isB2C]);

  const activePlans = isB2C ? b2cPlans : b2bPlans;

  return (
    <section id="planes" className="mx-auto max-w-7xl px-6 py-24 text-center">
      <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
        Planes y precios
      </h2>
      <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
        Elegí la opción que mejor se adapte a tus necesidades
      </p>

      {/* Toggle Selector B2C / B2B */}
      <div className="mt-8 flex justify-center">
        <div className="relative flex rounded-full bg-zinc-100 p-1 dark:bg-zinc-800">
          <button
            onClick={() => setIsB2C(true)}
            className={`relative z-10 rounded-full px-6 py-2 text-sm font-semibold transition-colors duration-200 ${
              isB2C ? "bg-white text-zinc-900 shadow-sm dark:bg-black dark:text-white" : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            }`}
          >
            Para mi evento
          </button>
          <button
            onClick={() => setIsB2C(false)}
            className={`relative z-10 rounded-full px-6 py-2 text-sm font-semibold transition-colors duration-200 ${
              !isB2C ? "bg-white text-zinc-900 shadow-sm dark:bg-black dark:text-white" : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            }`}
          >
            Para Salón/Empresa
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="mt-16 flex flex-col items-center justify-center gap-6 sm:flex-row sm:flex-wrap lg:items-stretch lg:justify-center">
        {activePlans.map((plan, idx) => (
          <div
            key={plan.codigo || plan.id || idx}
            className={`relative flex w-full max-w-sm flex-col rounded-3xl border bg-white p-8 shadow-sm transition-transform hover:-translate-y-2 dark:bg-zinc-900 ${
              plan.codigo === "B2C_PRO" || plan.codigo === "B2B_TEAM"
                ? "border-blue-500 shadow-xl shadow-blue-500/10 dark:border-blue-500"
                : "border-zinc-200 dark:border-zinc-800"
            }`}
          >
            {(plan.codigo === "B2C_PRO" || plan.codigo === "B2B_TEAM") && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                Recomendado
              </div>
            )}
            
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{plan.nombre}</h3>
            <p className="mt-2 flex-1 text-sm text-zinc-500 dark:text-zinc-400">{plan.descripcion}</p>
            
            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-zinc-900 dark:text-white">
                {plan.precio === null || plan.precio === undefined
                  ? plan.codigo.includes("FREE") ? "$0" : "Consultar"
                  : `$${plan.precio}`}
              </span>
              <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                {plan.periodo && plan.periodo !== "UNICO" ? `/${plan.periodo}` : ""}
              </span>
            </div>

            <ul className="mt-8 flex flex-col gap-4 text-left text-sm text-zinc-600 dark:text-zinc-400">
              {plan.features.map((feature, i) => {
                const featureName = typeof feature === "string" ? feature : feature.nombre;
                return (
                  <li key={i} className="flex items-center gap-3">
                    <svg className="h-5 w-5 shrink-0 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{featureName}</span>
                  </li>
                );
              })}
            </ul>

            <div className="mt-8">
              {isB2C ? (
                <Link
                  href={`/register?flow=b2c&plan=${plan.codigo}`}
                  className={`block w-full rounded-full py-3 text-center text-sm font-semibold transition-colors ${
                    plan.codigo === "B2C_PRO"
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
                  }`}
                >
                  Elegir {plan.nombre}
                </Link>
              ) : (
                <button
                  onClick={onOpenB2BModal}
                  className={`w-full rounded-full py-3 text-center text-sm font-semibold transition-colors ${
                    plan.codigo === "B2B_TEAM"
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
                  }`}
                >
                  Quiero {plan.nombre}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
