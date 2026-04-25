export interface Unidad {
    id_unidad: number;
    codigo: string;
    nombre: string;
    descripcion?: string;
    es_principal: boolean;
    activa: boolean;
    ciudad?: string;
}

export interface CreateUnidadInput {
    codigo: string;
    nombre: string;
    descripcion?: string;
}

export interface UpdateUnidadInput extends CreateUnidadInput {
    id_unidad: number;
    activo?: boolean;
}

export interface Cliente {
    id_cliente: number;
    nombre_cliente: string;
    email?: string;
    telefono?: string;
    notas?: string;
    id_unidad_principal?: number;
    unidad_principal?: string;
    es_activo: boolean;
    fecha_alta?: string;
}

export interface CreateClienteInput {
    nombre_cliente: string;
    email?: string;
    telefono?: string;
    notas?: string;
    id_unidad_principal?: number;
}

export interface UpdateClienteInput extends CreateClienteInput {
    id_cliente: number;
    activo?: boolean;
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

export async function getMisUnidades(soloActivas = true): Promise<Unidad[]> {
    const res = await fetch(`/api/cuenta-unidades?soloActivas=${soloActivas}`);
    if (!res.ok) throw new Error('Error al cargar unidades');
    const data = await res.json();
    return data.map((item: any) => ({
        id_unidad: item.id_unidad || item.idUnidad,
        codigo: item.codigo ?? '',
        nombre: item.nombre,
        descripcion: item.descripcion,
        es_principal: item.es_principal ?? item.esPrincipal ?? false,
        activa: item.activo ?? item.activa ?? true,
        ciudad: item.ciudad,
    }));
}

export async function createUnidad(input: CreateUnidadInput): Promise<{ ok: boolean; id_unidad: number }> {
    const res = await fetch('/api/cuenta-unidades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error('Error al crear unidad');
    return res.json();
}

export async function updateUnidad(input: UpdateUnidadInput): Promise<{ ok: boolean }> {
    const res = await fetch('/api/cuenta-unidades', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error('Error al actualizar unidad');
    return res.json();
}

export async function setActivoUnidad(idUnidad: number, activo: boolean): Promise<{ ok: boolean }> {
    const res = await fetch(`/api/cuenta-unidades/set-activo?idUnidad=${idUnidad}&activo=${activo}`, {
        method: 'PUT',
    });
    if (!res.ok) throw new Error('Error al cambiar estado de unidad');
    return res.json();
}

export async function getMisClientes(soloActivos = true): Promise<Cliente[]> {
    const res = await fetch(`/api/clientes?soloActivos=${soloActivos}`);
    if (!res.ok) throw new Error('Error al cargar clientes');
    const data = await res.json();
    return data.map((item: any) => ({
        id_cliente: item.id_cliente || item.idCliente,
        nombre_cliente: item.nombre_cliente || item.nombreCliente,
        email: item.email,
        telefono: item.telefono,
        notas: item.notas,
        id_unidad_principal: item.id_unidad_principal || item.idUnidadPrincipal,
        unidad_principal: item.unidad_principal || item.unidadPrincipal,
        es_activo: item.activo !== undefined ? item.activo : (item.esActivo ?? true),
        fecha_alta: item.fecha_alta || item.fechaAlta,
    }));
}

export async function createCliente(input: CreateClienteInput): Promise<{ ok: boolean; id_cliente: number }> {
    const res = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error('Error al crear cliente');
    return res.json();
}

export async function updateCliente(input: UpdateClienteInput): Promise<{ ok: boolean }> {
    const res = await fetch('/api/clientes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error('Error al actualizar cliente');
    return res.json();
}

export async function setActivoCliente(idCliente: number, activo: boolean): Promise<{ ok: boolean }> {
    const res = await fetch(`/api/clientes/set-activo?idCliente=${idCliente}&activo=${activo}`, {
        method: 'PUT',
    });
    if (!res.ok) throw new Error('Error al cambiar estado de cliente');
    return res.json();
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
