import { useInscripcion } from '../../hooks/useInscripcion';
import type { Participante, ContactoEmergencia, Medicacion, FichaSalud } from '../../types/inscripcion.types';
import { Plus, Trash2, AlertTriangle, Phone, Pill, ShieldAlert } from 'lucide-react';

interface Props {
    participante: Participante;
}

const FIELD_CLASS = 'w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-card-border bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-1 focus:ring-accent outline-none';
const LABEL_CLASS = 'text-xs font-medium text-gray-700 dark:text-gray-300';

export function TabSalud({ participante }: Props) {
    const { state, actualizarParticipante } = useInscripcion();

    const salud = participante.salud;
    const configSalud = (state.programaData?.configuracion_salud || {
        pedir_problema_medico: true,
        problema_medico_obligatorio: false,
        pedir_alergias_no_alimentarias: true,
        alergias_no_alimentarias_obligatorio: false,
        pedir_necesidad_especial: true,
        necesidad_especial_obligatorio: false,
        pedir_cobertura_medica: true,
        cobertura_medica_obligatorio: false,
        pedir_contacto_emergencia: true,
        contacto_emergencia_obligatorio: true,
        pedir_autoriza_emergencia_medica: true,
        autoriza_emergencia_medica_obligatorio: true,
        pedir_observaciones_familia: true,
        observaciones_familia_obligatorio: false,
        pedir_medicaciones: true,
        medicaciones_obligatorio: false,
    }) as Record<string, boolean>;

    const handleChangeSalud = (field: keyof FichaSalud, value: unknown) => {
        actualizarParticipante(participante._clientId, {
            salud: { ...salud, [field]: value },
        });
    };

    // ── Contactos de emergencia ──────────────────────────────────

    const handleChangeContacto = (index: number, campo: keyof ContactoEmergencia, valor: string | number) => {
        const lista = [...salud.contactos_emergencia];
        lista[index] = { ...lista[index], [campo]: valor };
        handleChangeSalud('contactos_emergencia', lista);
    };

    const handleAgregarContacto = () => {
        const nuevo: ContactoEmergencia = {
            nombre: '',
            telefono: '',
            relacion: '',
            orden: salud.contactos_emergencia.length + 1,
        };
        handleChangeSalud('contactos_emergencia', [...salud.contactos_emergencia, nuevo]);
    };

    const handleEliminarContacto = (index: number) => {
        const lista = salud.contactos_emergencia
            .filter((_, i) => i !== index)
            .map((c, i) => ({ ...c, orden: i + 1 }));
        handleChangeSalud('contactos_emergencia', lista);
    };

    // ── Medicaciones ─────────────────────────────────────────────

    const handleChangeMedicacion = (index: number, campo: keyof Medicacion, valor: string | boolean) => {
        const lista = [...salud.medicaciones];
        lista[index] = { ...lista[index], [campo]: valor };
        handleChangeSalud('medicaciones', lista);
    };

    const handleAgregarMedicacion = () => {
        const nueva: Medicacion = {
            nombre: '',
            dosis: '',
            frecuencia: '',
            indicaciones: '',
            requiere_autorizacion: false,
        };
        handleChangeSalud('medicaciones', [...salud.medicaciones, nueva]);
    };

    const handleEliminarMedicacion = (index: number) => {
        handleChangeSalud('medicaciones', salud.medicaciones.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-300">

            {/* ── Ficha médica ──────────────────────────────────── */}
            <section className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Información médica
                </h4>

                {/* Problema médico */}
                {configSalud.pedir_problema_medico && (
                    <div className="space-y-2">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={salud.tiene_problema_medico}
                                onChange={e => handleChangeSalud('tiene_problema_medico', e.target.checked)}
                                className="w-4 h-4 accent-accent"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                ¿El participante tiene algún problema médico a declarar?
                                {configSalud.problema_medico_obligatorio && <span className="text-red-500 ml-1">*</span>}
                            </span>
                        </label>
                        {salud.tiene_problema_medico && (
                            <textarea
                                placeholder="Describí el problema médico (diagnóstico, limitaciones, etc.)..."
                                value={salud.problema_medico_detalle || ''}
                                onChange={e => handleChangeSalud('problema_medico_detalle', e.target.value)}
                                rows={3}
                                className={`${FIELD_CLASS} resize-none`}
                            />
                        )}
                    </div>
                )}

                {/* Alergias no alimentarias */}
                {configSalud.pedir_alergias_no_alimentarias && (
                    <div className="space-y-2">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={salud.tiene_alergias_no_alimentarias}
                                onChange={e => handleChangeSalud('tiene_alergias_no_alimentarias', e.target.checked)}
                                className="w-4 h-4 accent-accent"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                ¿Tiene alergias no alimentarias? (medicamentos, materiales, etc.)
                                {configSalud.alergias_no_alimentarias_obligatorio && <span className="text-red-500 ml-1">*</span>}
                            </span>
                        </label>
                        {salud.tiene_alergias_no_alimentarias && (
                            <textarea
                                placeholder="Describí las alergias y posibles reacciones..."
                                value={salud.alergias_no_alimentarias_detalle || ''}
                                onChange={e => handleChangeSalud('alergias_no_alimentarias_detalle', e.target.value)}
                                rows={2}
                                className={`${FIELD_CLASS} resize-none`}
                            />
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {configSalud.pedir_necesidad_especial && (
                        <div className="space-y-1.5">
                            <label className={LABEL_CLASS}>
                                Necesidad especial {configSalud.necesidad_especial_obligatorio && '*'}
                            </label>
                            <input
                                type="text"
                                placeholder="Discapacidad, movilidad reducida, etc."
                                value={salud.necesidad_especial || ''}
                                onChange={e => handleChangeSalud('necesidad_especial', e.target.value)}
                                className={FIELD_CLASS}
                            />
                        </div>
                    )}
                    {configSalud.pedir_cobertura_medica && (
                        <div className="space-y-1.5">
                            <label className={LABEL_CLASS}>
                                Cobertura médica {configSalud.cobertura_medica_obligatorio && '*'}
                            </label>
                            <input
                                type="text"
                                placeholder="Obra social / Prepaga / OSDE, etc."
                                value={salud.cobertura_medica || ''}
                                onChange={e => handleChangeSalud('cobertura_medica', e.target.value)}
                                className={FIELD_CLASS}
                            />
                        </div>
                    )}
                    {configSalud.pedir_observaciones_familia && (
                        <div className="space-y-1.5 sm:col-span-2">
                            <label className={LABEL_CLASS}>
                                Observaciones para el equipo {configSalud.observaciones_familia_obligatorio && '*'}
                            </label>
                            <textarea
                                placeholder="Cualquier información de salud relevante para los monitores..."
                                value={salud.observaciones_familia || ''}
                                onChange={e => handleChangeSalud('observaciones_familia', e.target.value)}
                                rows={2}
                                className={`${FIELD_CLASS} resize-none`}
                            />
                        </div>
                    )}
                </div>
            </section>

            {/* ── Autorización de emergencia (OBLIGATORIO) ──────── */}
            {configSalud.pedir_autoriza_emergencia_medica && (
                <section className={`p-4 rounded-xl border-2 ${
                    salud.autoriza_emergencia_medica
                        ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10'
                        : 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10'
                }`}>
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={salud.autoriza_emergencia_medica}
                            onChange={e => handleChangeSalud('autoriza_emergencia_medica', e.target.checked)}
                            className="w-4 h-4 mt-0.5 accent-accent"
                        />
                        <div>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                                <ShieldAlert className="w-4 h-4 text-red-500" />
                                Autorizo atención médica de emergencia {configSalud.autoriza_emergencia_medica_obligatorio && '*'}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                                Autorizo al personal del programa a solicitar atención médica de urgencia en caso de ser necesario, incluyendo traslado a centro de salud.
                            </p>
                            {!salud.autoriza_emergencia_medica && configSalud.autoriza_emergencia_medica_obligatorio && (
                                <p className="text-xs text-red-600 dark:text-red-400 font-medium mt-1">
                                    ⚠ Requerido para confirmar la inscripción
                                </p>
                            )}
                        </div>
                    </label>
                </section>
            )}

            {/* ── Contactos de emergencia (OBLIGATORIO al menos 1) ─ */}
            {configSalud.pedir_contacto_emergencia && (
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Phone className="w-4 h-4 text-accent" />
                            Contactos de emergencia {configSalud.contacto_emergencia_obligatorio && '*'}
                            {salud.contactos_emergencia.length === 0 && configSalud.contacto_emergencia_obligatorio && (
                                <span className="text-xs text-red-500 font-normal">(obligatorio)</span>
                            )}
                        </h4>
                        <button
                            type="button"
                            onClick={handleAgregarContacto}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent/80 transition-colors"
                        >
                            <Plus className="w-3.5 h-3.5" /> Agregar
                        </button>
                    </div>

                    {salud.contactos_emergencia.length === 0 ? (
                        <div className="p-4 text-center border-2 border-dashed border-red-200 dark:border-red-800 rounded-xl">
                            <p className="text-sm text-gray-500 mb-3">Agregá al menos un contacto de emergencia.</p>
                            <button
                                type="button"
                                onClick={handleAgregarContacto}
                                className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80"
                            >
                                <Plus className="w-4 h-4" /> Agregar contacto
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {salud.contactos_emergencia.map((contacto, i) => (
                                <div key={i} className="p-4 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-200 dark:border-card-border relative">
                                    <button
                                        type="button"
                                        onClick={() => handleEliminarContacto(i)}
                                        className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pr-8">
                                        <div className="space-y-1">
                                            <label className={LABEL_CLASS}>Nombre completo *</label>
                                            <input
                                                type="text"
                                                value={contacto.nombre}
                                                onChange={e => handleChangeContacto(i, 'nombre', e.target.value)}
                                                className={FIELD_CLASS}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className={LABEL_CLASS}>Teléfono *</label>
                                            <input
                                                type="tel"
                                                value={contacto.telefono}
                                                onChange={e => handleChangeContacto(i, 'telefono', e.target.value)}
                                                className={FIELD_CLASS}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className={LABEL_CLASS}>Relación</label>
                                            <input
                                                type="text"
                                                placeholder="Mamá, Papá, Abuelo..."
                                                value={contacto.relacion}
                                                onChange={e => handleChangeContacto(i, 'relacion', e.target.value)}
                                                className={FIELD_CLASS}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            )}

            {/* ── Medicaciones ─────────────────────────────────────── */}
            {configSalud.pedir_medicaciones && (
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Pill className="w-4 h-4 text-purple-500" />
                            Medicaciones
                            <span className="text-xs font-normal text-gray-500">
                                {configSalud.medicaciones_obligatorio ? '(obligatorio)' : '(opcional)'}
                            </span>
                        </h4>
                        <button
                            type="button"
                            onClick={handleAgregarMedicacion}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent/80 transition-colors"
                        >
                            <Plus className="w-3.5 h-3.5" /> Agregar
                        </button>
                    </div>

                    {salud.medicaciones.length === 0 ? (
                        <div className="p-4 text-center border-2 border-dashed border-gray-200 dark:border-card-border rounded-xl">
                            <p className="text-sm text-gray-500">No hay medicaciones registradas.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {salud.medicaciones.map((med, i) => (
                                <div key={i} className="p-4 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-200 dark:border-card-border relative">
                                    <button
                                        type="button"
                                        onClick={() => handleEliminarMedicacion(i)}
                                        className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                                        <div className="space-y-1">
                                            <label className={LABEL_CLASS}>Medicamento *</label>
                                            <input type="text" value={med.nombre} onChange={e => handleChangeMedicacion(i, 'nombre', e.target.value)} className={FIELD_CLASS} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className={LABEL_CLASS}>Dosis</label>
                                            <input type="text" placeholder="Ej: 500mg" value={med.dosis} onChange={e => handleChangeMedicacion(i, 'dosis', e.target.value)} className={FIELD_CLASS} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className={LABEL_CLASS}>Frecuencia</label>
                                            <input type="text" placeholder="Ej: Cada 8 horas" value={med.frecuencia} onChange={e => handleChangeMedicacion(i, 'frecuencia', e.target.value)} className={FIELD_CLASS} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className={LABEL_CLASS}>Indicaciones</label>
                                            <input type="text" placeholder="Con comida, antes de dormir..." value={med.indicaciones} onChange={e => handleChangeMedicacion(i, 'indicaciones', e.target.value)} className={FIELD_CLASS} />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
                                                <input
                                                    type="checkbox"
                                                    checked={med.requiere_autorizacion}
                                                    onChange={e => handleChangeMedicacion(i, 'requiere_autorizacion', e.target.checked)}
                                                    className="w-4 h-4 accent-accent"
                                                />
                                                Requiere autorización médica para administración
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}
