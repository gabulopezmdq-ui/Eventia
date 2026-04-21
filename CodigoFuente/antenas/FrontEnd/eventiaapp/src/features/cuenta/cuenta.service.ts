export interface Unidad {
    id_unidad: number;
    nombre: string;
    es_principal: boolean;
    activa: boolean;
    ciudad?: string;
}

export interface Cliente {
    id_cliente: number;
    nombre_cliente: string;
    email?: string;
    telefono?: string;
    es_activo: boolean;
    unidad_principal?: string;
    fecha_alta?: string;
}

export interface CuentaPlan {
    id_cuenta: number;
    plan_nombre: string;
    plan_codigo: string;
    precio: number;
    moneda: string;
    periodo: string;
    limite_eventos?: number;
    limite_usuarios?: number;
    estado: string;
    renovacion?: string;
}

export async function getMisUnidades(): Promise<Unidad[]> {
    const res = await fetch('/api/cuenta-unidades');
    if (!res.ok) throw new Error('Error al cargar unidades');
    const data = await res.json();
    return data.map((item: any) => ({
        id_unidad: item.id_unidad || item.idUnidad,
        nombre: item.nombre,
        es_principal: item.es_principal ?? item.esPrincipal ?? false,
        activa: item.activo ?? item.activa ?? true,
        ciudad: item.ciudad,
    }));
}

export async function getMisClientes(): Promise<Cliente[]> {
    const res = await fetch('/api/clientes');
    if (!res.ok) throw new Error('Error al cargar clientes');
    const data = await res.json();
    return data.map((item: any) => ({
        id_cliente: item.id_cliente || item.idCliente,
        nombre_cliente: item.nombre_cliente || item.nombreCliente,
        email: item.email,
        telefono: item.telefono,
        es_activo: item.activo !== undefined ? item.activo : (item.esActivo ?? true),
        unidad_principal: item.unidad_principal || item.unidadPrincipal,
        fecha_alta: item.fecha_alta || item.fechaAlta,
    }));
}

export async function getMiPlan(): Promise<CuentaPlan> {
    const res = await fetch('/api/cuentas/plan');
    if (!res.ok) throw new Error('Error al cargar plan de cuenta');
    const data = await res.json();
    return {
        id_cuenta: data.id_cuenta || data.idCuenta,
        plan_nombre: data.planNombre || data.plan_nombre || 'Desconocido',
        plan_codigo: data.planCodigo || data.plan_codigo || 'N/A',
        precio: data.precio || 0,
        moneda: data.moneda || 'ARS',
        periodo: data.periodo || 'Mensual',
        limite_eventos: data.limiteEventos || data.limite_eventos,
        limite_usuarios: data.limiteUsuarios || data.limite_usuarios,
        estado: data.estado || 'Activo',
        renovacion: data.renovacion,
    };
}

export async function getCuentaEventos(): Promise<any[]> {
    const res = await fetch('/api/cuenta-eventos');
    if (!res.ok) throw new Error('Error al cargar eventos de la cuenta');
    const data = await res.json();
    // Reutilizamos estructura similar a Event normal pero desde la perspectiva B2B
    return data.map((item: any) => ({
         id_evento: item.id_evento || item.idEvento,
         anfitriones_texto: item.anfitriones_texto || item.anfitrionesTexto,
         fecha_hora: item.fecha_hora || item.fechaHora,
         lugar: item.lugar,
         estado: item.estado,
         cliente_nombre: item.cliente_nombre || item.clienteNombre,
         unidad_nombre: item.unidad_nombre || item.unidadNombre,
    }));
}
