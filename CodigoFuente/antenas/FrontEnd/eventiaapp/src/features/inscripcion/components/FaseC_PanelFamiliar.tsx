import { useState } from 'react';
import { useInscripcion } from '../hooks/useInscripcion';
import { ParticipanteCard } from './ui/ParticipanteCard';
import { BarraTotal } from './ui/BarraTotal';
import { createFichaSaludVacia } from '../types/inscripcion.types';
import { CheckCircle2, Edit2, Users, Plus, X } from 'lucide-react';

export function FaseC_PanelFamiliar() {
    const { state, abrirDrawerResponsable, agregarParticipante } = useInscripcion();
    const { responsable, participantes } = state;

    const [mostrarFormNuevo, setMostrarFormNuevo] = useState(false);
    const [nuevoParticipante, setNuevoParticipante] = useState({
        nombre: '',
        apellido: '',
        fecha_nacimiento: '',
        documento: '',
        observaciones: ''
    });
    const [erroresNuevo, setErroresNuevo] = useState<{ nombre?: string; apellido?: string; fecha_nacimiento?: string }>({});

    const handleAgregarClick = () => setMostrarFormNuevo(true);

    const handleCancelarNuevo = () => {
        setMostrarFormNuevo(false);
        setNuevoParticipante({ nombre: '', apellido: '', fecha_nacimiento: '', documento: '', observaciones: '' });
        setErroresNuevo({});
    };

    const handleSubmitNuevo = (e: React.FormEvent) => {
        e.preventDefault();

        // Validación explícita para garantizar que SIEMPRE se valide,
        // independientemente del comportamiento del navegador con `required` HTML5.
        const errores: { nombre?: string; apellido?: string; fecha_nacimiento?: string } = {};
        if (!nuevoParticipante.nombre.trim()) errores.nombre = 'El nombre es requerido';
        if (!nuevoParticipante.apellido.trim()) errores.apellido = 'El apellido es requerido';
        if (!nuevoParticipante.fecha_nacimiento) errores.fecha_nacimiento = 'La fecha de nacimiento es requerida';

        if (Object.keys(errores).length > 0) {
            setErroresNuevo(errores);
            return;
        }

        setErroresNuevo({});
        agregarParticipante({
            nombre: nuevoParticipante.nombre.trim(),
            apellido: nuevoParticipante.apellido.trim(),
            fecha_nacimiento: nuevoParticipante.fecha_nacimiento,
            documento: nuevoParticipante.documento || null,
            observaciones: nuevoParticipante.observaciones,
            periodos: [],
            servicios: [],
            restricciones_alimentarias: [],
            salud: createFichaSaludVacia(),
            autorizados_retiro: [],
        });
        handleCancelarNuevo();
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 pb-32">
            {/* Header Responsable */}
            <div 
                onClick={abrirDrawerResponsable}
                className="flex justify-between items-center p-4 bg-white dark:bg-card-bg rounded-xl border border-gray-200 dark:border-card-border shadow-sm cursor-pointer hover:border-accent transition-colors mb-8 group"
            >
                <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <div>
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {responsable.nombre} {responsable.apellido}
                        </span>
                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                            ({responsable.relacion})
                        </span>
                    </div>
                </div>
                <button className="flex items-center gap-1 text-sm font-medium text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit2 className="w-4 h-4" />
                    Editar
                </button>
            </div>

            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white mb-6">
                <Users className="w-6 h-6 text-accent" />
                Quiénes vienen
            </h2>

            <div className="space-y-6">
                {participantes.map(p => (
                    <ParticipanteCard
                        key={p._clientId}
                        participante={p}
                        restriccionesConfig={state.programaData?.restricciones_alimentarias_config ?? []}
                    />
                ))}
            </div>

            {/* Formulario nuevo participante o Botón */}
            {mostrarFormNuevo ? (
                <div className="mt-6 p-6 bg-gray-50 dark:bg-black/20 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Nuevo participante</h3>
                        <button onClick={handleCancelarNuevo} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <form onSubmit={handleSubmitNuevo} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nombre *</label>
                                <input 
                                    required type="text" 
                                    value={nuevoParticipante.nombre} 
                                    onChange={e => { setNuevoParticipante({...nuevoParticipante, nombre: e.target.value}); setErroresNuevo(prev => ({ ...prev, nombre: undefined })); }} 
                                    className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-accent outline-none ${erroresNuevo.nombre ? 'border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-card-border focus:border-accent'}`} 
                                />
                                {erroresNuevo.nombre && <p className="text-xs text-red-500 mt-1">{erroresNuevo.nombre}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Apellido *</label>
                                <input 
                                    required type="text" 
                                    value={nuevoParticipante.apellido} 
                                    onChange={e => { setNuevoParticipante({...nuevoParticipante, apellido: e.target.value}); setErroresNuevo(prev => ({ ...prev, apellido: undefined })); }} 
                                    className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-accent outline-none ${erroresNuevo.apellido ? 'border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-card-border focus:border-accent'}`} 
                                />
                                {erroresNuevo.apellido && <p className="text-xs text-red-500 mt-1">{erroresNuevo.apellido}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Fecha nacim. *</label>
                                <input 
                                    required type="date" 
                                    value={nuevoParticipante.fecha_nacimiento} 
                                    onChange={e => { setNuevoParticipante({...nuevoParticipante, fecha_nacimiento: e.target.value}); setErroresNuevo(prev => ({ ...prev, fecha_nacimiento: undefined })); }} 
                                    className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-accent outline-none ${erroresNuevo.fecha_nacimiento ? 'border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-card-border focus:border-accent'}`} 
                                />
                                {erroresNuevo.fecha_nacimiento && <p className="text-xs text-red-500 mt-1">{erroresNuevo.fecha_nacimiento}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Documento</label>
                                <input 
                                    type="text" 
                                    value={nuevoParticipante.documento} 
                                    onChange={e => setNuevoParticipante({...nuevoParticipante, documento: e.target.value})} 
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-card-border bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-accent focus:border-accent outline-none" 
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Observaciones (opcional)</label>
                            <input 
                                type="text" 
                                value={nuevoParticipante.observaciones} 
                                onChange={e => setNuevoParticipante({...nuevoParticipante, observaciones: e.target.value})} 
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-card-border bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-accent focus:border-accent outline-none" 
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <button 
                                type="button" 
                                onClick={handleCancelarNuevo} 
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit" 
                                className="px-6 py-2 text-sm font-medium bg-accent hover:bg-accent/90 text-white rounded-lg transition-colors"
                            >
                                Agregar
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="mt-6">
                    <button 
                        onClick={handleAgregarClick}
                        className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-accent/40 hover:border-accent/80 bg-accent/5 hover:bg-accent/10 rounded-xl transition-all group"
                    >
                        <div className="bg-white dark:bg-card-bg p-3 rounded-full shadow-sm group-hover:scale-110 transition-transform mb-3">
                            <Plus className="w-6 h-6 text-accent" />
                        </div>
                        <span className="text-lg font-semibold text-accent">Agregar hijo/a</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">Podés agregar hasta 6 participantes</span>
                    </button>
                </div>
            )}

            <BarraTotal />
        </div>
    );
}
