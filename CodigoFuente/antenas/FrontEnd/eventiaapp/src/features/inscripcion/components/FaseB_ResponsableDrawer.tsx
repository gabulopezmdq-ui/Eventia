import { useInscripcion } from '../hooks/useInscripcion';
import { User, Mail, Phone, Heart, CheckCircle2 } from 'lucide-react';

export function FaseB_ResponsableDrawer() {
    const { state, cerrarDrawerResponsable, guardarResponsable } = useInscripcion();
    const { responsable } = state;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
        guardarResponsable({ [e.target.name]: value });
    };

    const handleConfirmar = (e: React.FormEvent) => {
        e.preventDefault();
        cerrarDrawerResponsable();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-lg bg-white dark:bg-card-bg rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-card-border flex justify-between items-center bg-gray-50/50 dark:bg-black/20">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                        <User className="w-5 h-5 text-accent" />
                        Datos del Responsable
                    </h2>
                    {responsable.nombre && responsable.apellido && responsable.email && (
                        <button 
                            onClick={cerrarDrawerResponsable}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            aria-label="Cerrar"
                        >
                            ✕
                        </button>
                    )}
                </div>

                <form onSubmit={handleConfirmar} className="p-6 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nombre *</label>
                            <input 
                                required
                                name="nombre" 
                                value={responsable.nombre || ''} 
                                onChange={handleChange} 
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-card-border bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Apellido *</label>
                            <input 
                                required
                                name="apellido" 
                                value={responsable.apellido || ''} 
                                onChange={handleChange} 
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-card-border bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                            <Mail className="w-4 h-4 text-gray-400" />
                            Email de contacto *
                        </label>
                        <input 
                            required
                            type="email"
                            name="email" 
                            value={responsable.email || ''} 
                            onChange={handleChange} 
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-card-border bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                            <Phone className="w-4 h-4 text-gray-400" />
                            Teléfono (Móvil) *
                        </label>
                        <input 
                            required
                            type="tel"
                            name="telefono" 
                            value={responsable.telefono || ''} 
                            onChange={handleChange} 
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-card-border bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                            <User className="w-4 h-4 text-gray-400" />
                            Documento / Pasaporte *
                        </label>
                        <input 
                            required
                            type="text"
                            name="documento" 
                            value={responsable.documento || ''} 
                            onChange={handleChange} 
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-card-border bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                            <Heart className="w-4 h-4 text-gray-400" />
                            Relación con el participante *
                        </label>
                        <select 
                            required
                            name="relacion" 
                            value={responsable.relacion || ''} 
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-card-border bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all"
                        >
                            <option value="">Seleccione...</option>
                            <option value="Padre/Madre">Padre / Madre</option>
                            <option value="Tutor">Tutor Legal</option>
                            <option value="Familiar">Familiar (Abuelo/a, Tío/a)</option>
                            <option value="Otro">Otro</option>
                        </select>
                    </div>

                    <div className="pt-2 space-y-3">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input 
                                type="checkbox"
                                name="acepta_comunicaciones"
                                checked={responsable.acepta_comunicaciones || false}
                                onChange={handleChange}
                                className="mt-1 w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent dark:bg-black dark:border-card-border"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Acepto recibir comunicaciones importantes relacionadas con el programa.</span>
                        </label>
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input 
                                type="checkbox"
                                name="acepta_promociones"
                                checked={responsable.acepta_promociones || false}
                                onChange={handleChange}
                                className="mt-1 w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent dark:bg-black dark:border-card-border"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Acepto recibir promociones y novedades de futuros eventos.</span>
                        </label>
                    </div>

                    <div className="pt-4">
                        <button 
                            type="submit" 
                            className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                        >
                            <CheckCircle2 className="w-5 h-5" />
                            Confirmar y Continuar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
