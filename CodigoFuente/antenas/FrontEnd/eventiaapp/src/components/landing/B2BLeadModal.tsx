"use client";

import React, { useState } from "react";

interface B2BLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function B2BLeadModal({ isOpen, onClose }: B2BLeadModalProps) {
  const [formData, setFormData] = useState({
    nombre_apellido: "",
    empresa_nombre: "",
    ciudad: "",
    pais: "AR",
    email: "",
    whatsapp: "",
    eventos_por_mes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email && !formData.whatsapp) {
      setError("Debes ingresar al menos Email o WhatsApp para poder contactarte.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const payload = {
        ...formData,
        origen: "LANDING_MODAL",
        pagina_origen: "/",
        eventos_por_mes: formData.eventos_por_mes ? parseInt(formData.eventos_por_mes, 10) : null
      };

      const res = await fetch("/api/prospectos_b2b/QuieroInfo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error("Respuesta fallida del servidor");
      }

      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl dark:bg-zinc-900 p-8 overflow-hidden transform transition-all">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {success ? (
          <div className="text-center py-12 animate-fade-in">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="mt-4 text-xl font-bold text-zinc-900 dark:text-zinc-100">¡Listo!</h3>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Recibimos tu solicitud. Te contactaremos a la brevedad.
            </p>
            <button
              onClick={onClose}
              className="mt-6 w-full rounded-xl bg-black px-4 py-3 text-white hover:bg-zinc-800 dark:bg-white dark:text-black font-medium transition"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                Eventia para salones / empresas
              </h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Estamos abriendo cupos para empresas, salones y planners. Dejanos tus datos y te contactamos.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg dark:bg-red-900/30 dark:text-red-400">
                  {error}
                </div>
              )}
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Nombre y Apellido *</label>
                  <input required name="nombre_apellido" onChange={handleChange} className="mt-1 block w-full rounded-lg border-zinc-300 bg-zinc-50 px-3 py-2 text-zinc-900 focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Empresa / Salón *</label>
                  <input required name="empresa_nombre" onChange={handleChange} className="mt-1 block w-full rounded-lg border-zinc-300 bg-zinc-50 px-3 py-2 text-zinc-900 focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</label>
                  <input type="email" name="email" onChange={handleChange} className="mt-1 block w-full rounded-lg border-zinc-300 bg-zinc-50 px-3 py-2 text-zinc-900 focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" placeholder="Opcional pero recomendado" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">WhatsApp</label>
                  <input type="tel" name="whatsapp" onChange={handleChange} className="mt-1 block w-full rounded-lg border-zinc-300 bg-zinc-50 px-3 py-2 text-zinc-900 focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" placeholder="Opcional pero recomendado" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Ciudad *</label>
                  <input required name="ciudad" onChange={handleChange} className="mt-1 block w-full rounded-lg border-zinc-300 bg-zinc-50 px-3 py-2 text-zinc-900 focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">País</label>
                  <select name="pais" value={formData.pais} onChange={handleChange} className="mt-1 block w-full rounded-lg border-zinc-300 bg-zinc-50 px-3 py-2 text-zinc-900 focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white">
                    <option value="AR">Argentina</option>
                    <option value="UY">Uruguay</option>
                    <option value="CL">Chile</option>
                    <option value="ES">España</option>
                    <option value="MX">México</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Eventos por mes (opcional)</label>
                <input type="number" name="eventos_por_mes" onChange={handleChange} min="0" className="mt-1 block w-full rounded-lg border-zinc-300 bg-zinc-50 px-3 py-2 text-zinc-900 focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {isSubmitting ? "Enviando..." : "Enviar"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
