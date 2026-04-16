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



export default function PricingSection({ onOpenB2BModal }: PricingSectionProps) {
  const [isB2C, setIsB2C] = useState(true);
  const [b2cPlans, setB2cPlans] = useState<Plan[]>([]);
  const [b2bPlans, setB2bPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/planesPublic/PublicCatalog?mercado=AR&moneda=ARS&tipo=${isB2C ? 'B2C' : 'B2B'}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
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
      <div className="mt-16 flex flex-col flex-wrap gap-6 sm:flex-row sm:items-stretch lg:justify-center">
        {loading ? (
          <div className="flex w-full items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : activePlans.length === 0 ? (
          <p className="w-full py-12 text-center text-zinc-500 dark:text-zinc-400">No hay planes disponibles por el momento.</p>
        ) : (
          activePlans.map((plan, idx) => (
            <PricingCard 
              key={plan.codigo || plan.id || idx}
              plan={plan}
              isB2C={isB2C}
              onOpenB2BModal={onOpenB2BModal}
            />
          ))
        )}
      </div>
    </section>
  );
}

function PricingCard({ plan, isB2C, onOpenB2BModal }: { plan: Plan; isB2C: boolean; onOpenB2BModal: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const INITIAL_FEATURES = 4;
  const hasMoreFeatures = plan.features.length > INITIAL_FEATURES;
  const featuresToShow = isExpanded ? plan.features : plan.features.slice(0, INITIAL_FEATURES);

  return (
    <div
      className={`relative flex w-full sm:flex-1 sm:min-w-[300px] max-w-sm flex-col rounded-3xl border bg-white p-8 shadow-sm transition-transform hover:-translate-y-2 dark:bg-zinc-900 mx-auto ${
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
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{plan.descripcion}</p>
      
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

      <ul className="mt-8 flex flex-col gap-4 text-left text-sm text-zinc-600 dark:text-zinc-400 flex-1">
        {featuresToShow.map((feature, i) => {
          const featureName = typeof feature === "string" ? feature : feature.nombre;
          return (
            <li key={i} className="flex items-start gap-3">
              <svg className="h-5 w-5 shrink-0 mt-0.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{featureName}</span>
            </li>
          );
        })}
        
        {hasMoreFeatures && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 flex w-fit items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            {isExpanded ? (
              <>
                Ver menos
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </>
            ) : (
              <>
                Ver todos ({plan.features.length - INITIAL_FEATURES} más)
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </>
            )}
          </button>
        )}
      </ul>

      <div className="mt-8 pt-4 border-t border-zinc-100 dark:border-zinc-800">
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
  );
}
