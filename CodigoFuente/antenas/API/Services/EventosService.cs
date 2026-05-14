using API.DataSchema;
using API.DataSchema.DTO;
using API.Domain;
using API.Utility;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DataSchema.DTO.Programas;
using API.Services.Planes;

namespace API.Services
{
    public class EventosService : IEventosService
    {
        private readonly DataContext _context;

        // Debe coincidir con ef_param_traducciones.entidad
        private const string ENT_TIPO_EVENTO = "TIPO_EVENTO";
        private const string ENT_DRESS_CODE = "DRESS_CODE";

        public EventosService(DataContext context)
        {
            _context = context;
        }

        // =========================================================
        // Query base enriquecido: eventos + tipo_evento + traducción + dress_code + PLAN
        // =========================================================
        private IQueryable<EventoResponse> QueryEventosConTipo()
        {
            // OJO: tu ef_tipos_evento tiene: id_tipo_evento, activo, codigo
            // y ef_param_traducciones: entidad, id_item (bigint), id_idioma, texto, activo
            var q =
                from ev in _context.Set<ef_eventos>()
                join te in _context.Set<ef_tipos_evento>() on ev.id_tipo_evento equals te.id_tipo_evento

                join tr in _context.Set<ef_param_traducciones>()
                    on new
                    {
                        entidad = ENT_TIPO_EVENTO,
                        id_item = (long)ev.id_tipo_evento,
                        id_idioma = ev.id_idioma,
                        activo = true
                    }
                    equals new
                    {
                        entidad = tr.entidad,
                        id_item = tr.id_item,
                        id_idioma = tr.id_idioma,
                        activo = tr.activo
                    }
                    into trj
                from tr in trj.DefaultIfEmpty()

                    // DRESS CODE (LEFT)
                join dc in _context.Set<ef_dress_code>()
                    on ev.id_dress_code equals dc.id_dress_code into dcJ
                from dc in dcJ.DefaultIfEmpty()

                    // TRADUCCIÓN DRESS CODE (LEFT, depende de dc)
                join trDc in _context.Set<ef_param_traducciones>()
                    on new
                    {
                        entidad = ENT_DRESS_CODE,
                        id_item = (long?)dc.id_dress_code,
                        id_idioma = (short?)ev.id_idioma,
                        activo = (bool?)true
                    }
                    equals new
                    {
                        entidad = trDc.entidad,
                        id_item = (long?)trDc.id_item,
                        id_idioma = (short?)trDc.id_idioma,
                        activo = (bool?)trDc.activo
                    }
                    into trDcJ
                from trDc in trDcJ.DefaultIfEmpty()

                    // PLAN DEL EVENTO
                join pl in _context.Set<ef_planes>()
                    on ev.id_plan equals pl.id_plan into plJ
                from pl in plJ.DefaultIfEmpty()

                    // CUENTA
                join cta in _context.Set<ef_cuentas>()
                    on ev.id_cuenta equals cta.id_cuenta into ctaJ
                from cta in ctaJ.DefaultIfEmpty()

                    // UNIDAD
                join un in _context.Set<ef_cuenta_unidades>()
                    on ev.id_unidad equals un.id_unidad into unJ
                from un in unJ.DefaultIfEmpty()

                    // CLIENTE
                join cli in _context.Set<ef_clientes>()
                    on ev.id_cliente equals cli.id_cliente into cliJ
                from cli in cliJ.DefaultIfEmpty()

                    // PLAN DE CUENTA
                join plCta in _context.Set<ef_planes>()
                    on cta.id_plan equals plCta.id_plan into plCtaJ
                from plCta in plCtaJ.DefaultIfEmpty()


                select new EventoResponse
                {
                    IdEvento = ev.id_evento,
                    IdTipoEvento = ev.id_tipo_evento,
                    TipoEventoCodigo = te.codigo,
                    TipoEventoDescripcion = (tr != null && !string.IsNullOrWhiteSpace(tr.texto)) ? tr.texto : te.codigo,

                    IdIdioma = ev.id_idioma,


                    IdCuenta = ev.id_cuenta,
                    IdUnidad = ev.id_unidad,
                    UnidadNombre = un != null ? un.nombre : null,
                    IdCliente = ev.id_cliente,
                    ClienteNombre = cli != null ? cli.nombre_cliente : null,

                    Modalidad =
                    ev.id_cuenta == null
                    ? null
                    : (ev.id_cliente == null ? "PROPIO" : "CLIENTE"),


                    AnfitrionesTexto = ev.anfitriones_texto,
                    Estado = ev.estado,
                    FechaAlta = ev.fecha_alta,

                    TipoOperacion = ev.tipo_operacion,
                    FechaInicio = ev.fecha_inicio,
                    FechaFin = ev.fecha_fin,

                    IdDressCode = ev.id_dress_code,
                    DressCodeDescripcion = ev.dress_code_descripcion,
                    DressCodeTexto =
                        (trDc != null && !string.IsNullOrWhiteSpace(trDc.texto))
                            ? trDc.texto
                            : (dc != null ? dc.codigo : null),

                    Saludo = ev.saludo,
                    MensajeBienvenida = ev.mensaje_bienvenida,
                    Notas = ev.notas,

                    //plan
                    IdPlan = ev.id_plan,
                    PlanCodigo = pl != null ? pl.codigo : null,
                    PlanNombre = pl != null ? pl.nombre : null,


                    CuentaPlanCodigo = plCta != null ? plCta.codigo : null,
                    CuentaPlanNombre = plCta != null ? plCta.nombre : null
                };

            return q;
        }

        // =========================
        // CREAR EVENTO
        // =========================
        //este ese el original que anda pero lo comento por las dudas que el nuevo no funcione o deje de andar algo que ya andaba
        //public async Task<EventoResponse> CrearEventoAsync(long idUsuario, EventoCreateRequest req)
        //{
        //    if (req.IdTipoEvento <= 0)
        //        throw new InvalidOperationException("Tipo de evento obligatorio.");

        //    if (req.IdIdioma <= 0)
        //        throw new InvalidOperationException("Idioma obligatorio.");

        //    if (string.IsNullOrWhiteSpace(req.AnfitrionesTexto))
        //        throw new InvalidOperationException("Anfitriones obligatorio.");

        //    if (req.AnfitrionesTexto.Length > 500)
        //        throw new InvalidOperationException("Anfitriones supera 500 caracteres.");

        //    if (req.IdDressCode is null && !string.IsNullOrWhiteSpace(req.DressCodeDescripcion))
        //        throw new InvalidOperationException("No se puede indicar detalle de dress code sin seleccionar dress code.");

        //    bool existeTipo = await _context.Set<ef_tipos_evento>()
        //        .AnyAsync(t => t.id_tipo_evento == req.IdTipoEvento && t.activo == true);

        //    if (!existeTipo)
        //        throw new InvalidOperationException("El tipo de evento no existe o está inactivo.");

        //    short idIdioma = req.IdIdioma ?? Idiomas.DefaultIdiomaId;

        //    bool existeIdioma = await _context.Set<ef_idiomas>()
        //        .AnyAsync(i => i.id_idioma == idIdioma && i.activo == true);

        //    if (!existeIdioma)
        //        throw new InvalidOperationException("El idioma no existe o está inactivo.");

        //    if (req.IdDressCode.HasValue)
        //    {
        //        bool existeDress = await _context.Set<ef_dress_code>()
        //            .AnyAsync(d => d.id_dress_code == req.IdDressCode.Value && d.activo == true);

        //        if (!existeDress)
        //            throw new InvalidOperationException("El dress code no existe o está inactivo.");
        //    }

        //    // ✅ Resolver plan elegido (null => FREE)
        //    var codigoPlan = string.IsNullOrWhiteSpace(req.CodigoPlan) ? "B2C_FREE" : req.CodigoPlan.Trim();

        //    var plan = await _context.Set<ef_planes>()
        //        .Where(p => p.codigo == codigoPlan && p.activo == true && p.tipo == "B2C")
        //        .Select(p => new { p.id_plan, p.codigo })
        //        .SingleOrDefaultAsync();

        //    if (plan == null)
        //        throw new InvalidOperationException("El plan seleccionado no existe o está inactivo.");

        //    //Regla actual (un borrador por usuario) 
        //    bool yaTieneBorrador = await _context.Set<ef_evento_usuarios>()
        //        .AnyAsync(eu =>
        //            eu.id_usuario == idUsuario &&
        //            eu.activo == true &&
        //            _context.Set<ef_eventos>().Any(ev => ev.id_evento == eu.id_evento && ev.estado == EventoEstado.Borrador));

        //    if (yaTieneBorrador)
        //        throw new InvalidOperationException("Ya tienes un evento en borrador. Activa o elimina ese evento para crear otro.");


        //    short idRolOwner = await _context.Set<ef_roles>()
        //        .Where(r => r.codigo == RolesCodigo.EventOwner && r.activo == true)
        //        .Select(r => r.id_rol)
        //        .SingleAsync();

        //    await using var tx = await _context.Database.BeginTransactionAsync();

        //    var now = DateTimeOffset.UtcNow;

        //    var evento = new ef_eventos
        //    {
        //        id_tipo_evento = req.IdTipoEvento,
        //        id_idioma = idIdioma,
        //        id_cliente = null,
        //        anfitriones_texto = req.AnfitrionesTexto.Trim(),

        //        id_dress_code = req.IdDressCode,
        //        dress_code_descripcion = string.IsNullOrWhiteSpace(req.DressCodeDescripcion) ? null : req.DressCodeDescripcion.Trim(),

        //        saludo = string.IsNullOrWhiteSpace(req.Saludo) ? null : req.Saludo.Trim(),
        //        mensaje_bienvenida = string.IsNullOrWhiteSpace(req.MensajeBienvenida) ? null : req.MensajeBienvenida.Trim(),
        //        notas = string.IsNullOrWhiteSpace(req.Notas) ? null : req.Notas.Trim(),

        //        fecha_alta = now,
        //        fecha_modif = null,

        //        es_publico = false,
        //        modo_acceso = "I",
        //        modo_asistencia = "R",

        //        // asignar plan
        //        id_plan = plan.id_plan,

        //        // estado inicial según plan
        //        estado = (plan.codigo == "B2C_FREE") ? EventoEstado.Borrador : EventoEstado.PendientePago

        //    };

        //    _context.Set<ef_eventos>().Add(evento);
        //    await _context.SaveChangesAsync();


        //    // =====================================================
        //    // CREAR ACCESO DEFAULT DEL EVENTO
        //    // =====================================================
        //    var acceso = new ef_evento_accesos
        //    {
        //        id_evento = evento.id_evento,
        //        nombre = "General",
        //        orden = 1,
        //        activo = true,
        //        fecha_alta = now
        //    };

        //    _context.Set<ef_evento_accesos>().Add(acceso);
        //    await _context.SaveChangesAsync();


        //    // =====================================================
        //    // CREAR LINK DEFAULT DEL ACCESO
        //    // =====================================================
        //    var link = new ef_evento_acceso_links
        //    {
        //        id_acceso = acceso.id_acceso,
        //        titulo = "Principal",
        //        token = TokenUtility.Generate(64),
        //        max_personas_total = 200,
        //        max_adultos = 200,
        //        activo = true,
        //        fecha_alta = now
        //    };

        //    _context.Set<ef_evento_acceso_links>().Add(link);
        //    await _context.SaveChangesAsync();


        //    // guardar acceso default en el evento
        //    evento.id_acceso_default = acceso.id_acceso;
        //    await _context.SaveChangesAsync();


        //    // =====================================================
        //    // RELACIÓN USUARIO DUEÑO
        //    // =====================================================
        //    _context.Set<ef_evento_usuarios>().Add(new ef_evento_usuarios
        //    {
        //        id_evento = evento.id_evento,
        //        id_usuario = idUsuario,
        //        id_rol = idRolOwner,
        //        fecha_alta = now,
        //        activo = true
        //    });


        //    // =====================================================
        //    // HISTORIAL DE ESTADO
        //    // =====================================================
        //    _context.Set<ef_evento_estados_hist>().Add(new ef_evento_estados_hist
        //    {
        //        id_evento = evento.id_evento,
        //        id_usuario = idUsuario,
        //        fecha = now,
        //        estado = evento.estado,
        //        observaciones = (plan.codigo == "B2C_FREE")
        //            ? "Creación evento (FREE) - trial 7 días"
        //            : $"Creación evento (plan {plan.codigo}) - pendiente de pago"
        //    });

        //    // ✅ Trial / Pago pendiente (sin campos nuevos)
        //    if (plan.codigo == "B2C_FREE")
        //    {
        //        _context.Set<ef_suscripciones>().Add(new ef_suscripciones
        //        {
        //            scope = "EVENTO",
        //            id_evento = evento.id_evento,
        //            id_plan = plan.id_plan,
        //            estado = "ACTIVA",
        //            auto_renueva = false,
        //            periodo = "UNICO",
        //            current_period_start = now,
        //            current_period_end = now.AddDays(7),
        //            activo = true,
        //            fecha_alta = now
        //        });
        //    }
        //    else
        //    {
        //        _context.Set<ef_pagos>().Add(new ef_pagos
        //        {
        //            id_evento = evento.id_evento,
        //            tipo = "UNICO",
        //            estado = "PENDIENTE",
        //            moneda = "ARS",
        //            importe = 0,
        //            impuestos = 0,
        //            total = 0,
        //            concepto = $"Plan {plan.codigo} pendiente - evento {evento.id_evento}",
        //            activo = true,
        //            fecha_alta = now
        //        });
        //    }

        //    await _context.SaveChangesAsync();
        //    await tx.CommitAsync();

        //    return await GetEventoMioAsync(idUsuario, evento.id_evento);
        //}

        //este es el nuevo con todos los campos y necesarios para cuentas, unidades, clientes, modalidades, eventos publicos o no, etc
        //lo comento tambien porque no contemplaba idCuenta para eventos B2B
        //public async Task<EventoResponse> CrearEventoAsync(long idUsuario, EventoCreateRequest req)
        //{
        //    if (req.IdTipoEvento <= 0)
        //        throw new InvalidOperationException("Tipo de evento obligatorio.");

        //    if (req.IdIdioma <= 0)
        //        throw new InvalidOperationException("Idioma obligatorio.");

        //    if (string.IsNullOrWhiteSpace(req.AnfitrionesTexto))
        //        throw new InvalidOperationException("Anfitriones obligatorio.");

        //    if (req.AnfitrionesTexto.Length > 500)
        //        throw new InvalidOperationException("Anfitriones supera 500 caracteres.");

        //    if (req.IdDressCode is null && !string.IsNullOrWhiteSpace(req.DressCodeDescripcion))
        //        throw new InvalidOperationException("No se puede indicar detalle de dress code sin seleccionar dress code.");

        //    //bool existeTipo = await _context.Set<ef_tipos_evento>()
        //    //    .AnyAsync(t => t.id_tipo_evento == req.IdTipoEvento && t.activo == true);

        //    //if (!existeTipo)
        //    //    throw new InvalidOperationException("El tipo de evento no existe o está inactivo.");

        //    bool existeIdioma = await _context.Set<ef_idiomas>()
        //        .AnyAsync(i => i.id_idioma == req.IdIdioma && i.activo == true);

        //    if (!existeIdioma)
        //        throw new InvalidOperationException("El idioma no existe o está inactivo.");

        //    if (req.IdDressCode.HasValue)
        //    {
        //        bool existeDress = await _context.Set<ef_dress_code>()
        //            .AnyAsync(d => d.id_dress_code == req.IdDressCode.Value && d.activo == true);

        //        if (!existeDress)
        //            throw new InvalidOperationException("El dress code no existe o está inactivo.");
        //    }

        //    //        var tipoOperacion = string.IsNullOrWhiteSpace(req.TipoOperacion)
        //    //            ? "EVENTO"
        //    //:           req.TipoOperacion.Trim().ToUpperInvariant();

        //    //        if (tipoOperacion != "EVENTO" && tipoOperacion != "PROGRAMA")
        //    //            throw new InvalidOperationException("tipo_operacion inválido. Valores permitidos: EVENTO, PROGRAMA.");

        //    var tipoEvento = await _context.Set<ef_tipos_evento>()
        //            .AsNoTracking()
        //            .SingleOrDefaultAsync(t => t.id_tipo_evento == req.IdTipoEvento && t.activo == true);

        //    if (tipoEvento == null)
        //        throw new InvalidOperationException("El tipo de evento no existe o está inactivo.");

        //    var tipoOperacion = string.IsNullOrWhiteSpace(tipoEvento.tipo_operacion)
        //        ? "EVENTO"
        //        : tipoEvento.tipo_operacion.Trim().ToUpperInvariant();

        //    if (tipoOperacion != "EVENTO" && tipoOperacion != "PROGRAMA")
        //        throw new InvalidOperationException("El tipo de evento tiene tipo_operacion inválido.");

        //    if (tipoOperacion == "PROGRAMA")
        //    {
        //        if (!req.FechaInicio.HasValue || !req.FechaFin.HasValue)
        //            throw new InvalidOperationException("Para programas se requiere fecha_inicio y fecha_fin.");

        //        if (req.FechaFin.Value < req.FechaInicio.Value)
        //            throw new InvalidOperationException("fecha_fin no puede ser menor a fecha_inicio.");
        //    }

        //    bool esB2B = req.IdCuenta.HasValue;

        //    if (!string.IsNullOrWhiteSpace(req.Modalidad))
        //    {
        //        var modalidad = req.Modalidad.Trim().ToUpperInvariant();
        //        if (modalidad != "PROPIO" && modalidad != "CLIENTE")
        //            throw new InvalidOperationException("Modalidad inválida. Valores permitidos: PROPIO, CLIENTE.");
        //    }

        //    ef_cuentas? cuenta = null;
        //    ef_cuenta_unidades? unidad = null;
        //    ef_clientes? cliente = null;

        //    ef_planes? planB2C = null;

        //    // =====================================================
        //    // VALIDACIONES B2C / B2B
        //    // =====================================================
        //    if (!esB2B)
        //    {
        //        // B2C
        //        if (req.IdUnidad.HasValue)
        //            throw new InvalidOperationException("No corresponde informar unidad en un evento B2C.");

        //        if (req.IdCliente.HasValue)
        //            throw new InvalidOperationException("No corresponde informar cliente en un evento B2C.");

        //        bool yaTieneBorrador = await _context.Set<ef_evento_usuarios>()
        //            .AnyAsync(eu =>
        //                eu.id_usuario == idUsuario &&
        //                eu.activo == true &&
        //                _context.Set<ef_eventos>().Any(ev => ev.id_evento == eu.id_evento && ev.estado == EventoEstado.Borrador));

        //        if (yaTieneBorrador)
        //            throw new InvalidOperationException("Ya tienes un evento en borrador. Activa o elimina ese evento para crear otro.");

        //        var codigoPlan = string.IsNullOrWhiteSpace(req.CodigoPlan) ? "B2C_FREE" : req.CodigoPlan.Trim();

        //        planB2C = await _context.Set<ef_planes>()
        //            .SingleOrDefaultAsync(p => p.codigo == codigoPlan && p.activo == true && p.tipo == "B2C");

        //        if (planB2C == null)
        //            throw new InvalidOperationException("El plan seleccionado no existe o está inactivo.");
        //    }
        //    else
        //    {
        //        // B2B
        //        if (!req.IdUnidad.HasValue)
        //            throw new InvalidOperationException("En B2B la unidad es obligatoria.");

        //        var modalidad = (req.Modalidad ?? string.Empty).Trim().ToUpperInvariant();

        //        if (modalidad == "PROPIO" && req.IdCliente.HasValue)
        //            throw new InvalidOperationException("Un evento B2B en modalidad PROPIO no debe informar cliente.");

        //        if (modalidad == "CLIENTE" && !req.IdCliente.HasValue)
        //            throw new InvalidOperationException("Un evento B2B en modalidad CLIENTE debe informar cliente.");

        //        // validar cuenta del usuario
        //        var cuentaUsuario = await _context.Set<ef_cuenta_usuarios>()
        //            .AsNoTracking()
        //            .AnyAsync(cu => cu.id_cuenta == req.IdCuenta.Value && cu.id_usuario == idUsuario && cu.activo == true);

        //        if (!cuentaUsuario)
        //            throw new UnauthorizedAccessException("No tienes acceso a la cuenta indicada.");

        //        cuenta = await _context.Set<ef_cuentas>()
        //            .SingleOrDefaultAsync(c => c.id_cuenta == req.IdCuenta.Value && c.estado == "A");

        //        if (cuenta == null)
        //            throw new InvalidOperationException("La cuenta no existe o no está activa.");

        //        unidad = await _context.Set<ef_cuenta_unidades>()
        //            .SingleOrDefaultAsync(u => u.id_unidad == req.IdUnidad.Value && u.id_cuenta == req.IdCuenta.Value && u.activo == true);

        //        if (unidad == null)
        //            throw new InvalidOperationException("La unidad no existe, no pertenece a la cuenta o está inactiva.");

        //        if (req.IdCliente.HasValue)
        //        {
        //            cliente = await _context.Set<ef_clientes>()
        //                .SingleOrDefaultAsync(c =>
        //                    c.id_cliente == req.IdCliente.Value &&
        //                    c.id_cuenta == req.IdCuenta.Value &&
        //                    c.activo == true);

        //            if (cliente == null)
        //                throw new InvalidOperationException("El cliente no existe, no pertenece a la cuenta o está inactivo.");

        //            bool relacionExiste = await _context.Set<ef_cliente_unidades>()
        //                .AnyAsync(x => x.id_cliente == req.IdCliente.Value && x.id_unidad == req.IdUnidad.Value);

        //            if (!relacionExiste)
        //            {
        //                _context.Set<ef_cliente_unidades>().Add(new ef_cliente_unidades
        //                {
        //                    id_cliente = req.IdCliente.Value,
        //                    id_unidad = req.IdUnidad.Value,
        //                    es_principal = false,
        //                    activo = true,
        //                    fecha_alta = DateTimeOffset.UtcNow
        //                });
        //            }
        //        }

        //        // En B2B, el plan se toma de la cuenta; no del request
        //        req.CodigoPlan = null;
        //    }

        //    short idRolOwner = await _context.Set<ef_roles>()
        //        .Where(r => r.codigo == RolesCodigo.EventOwner && r.activo == true)
        //        .Select(r => r.id_rol)
        //        .SingleAsync();

        //    await using var tx = await _context.Database.BeginTransactionAsync();

        //    var now = DateTimeOffset.UtcNow;

        //    string estadoInicial;
        //    long? idPlanEvento = null;
        //    string observacionHistorial;

        //    if (!esB2B)
        //    {
        //        idPlanEvento = planB2C!.id_plan;
        //        estadoInicial = (planB2C.codigo == "B2C_FREE")
        //            ? EventoEstado.Borrador
        //            : EventoEstado.PendientePago;

        //        observacionHistorial = (planB2C.codigo == "B2C_FREE")
        //            ? "Creación evento (FREE) - trial 7 días"
        //            : $"Creación evento (plan {planB2C.codigo}) - pendiente de pago";
        //    }
        //    else
        //    {
        //        // B2B: el plan vive en la cuenta, no en el evento
        //        idPlanEvento = cuenta!.id_plan;
        //        estadoInicial = EventoEstado.Borrador;
        //        observacionHistorial = "Creación evento B2B";
        //    }

        //    var evento = new ef_eventos
        //    {
        //        id_tipo_evento = req.IdTipoEvento,
        //        id_idioma = req.IdIdioma,

        //        id_cuenta = esB2B ? req.IdCuenta : null,
        //        id_unidad = esB2B ? req.IdUnidad : null,
        //        id_cliente = esB2B ? req.IdCliente : null,

        //        anfitriones_texto = req.AnfitrionesTexto.Trim(),
        //        id_dress_code = req.IdDressCode,
        //        dress_code_descripcion = string.IsNullOrWhiteSpace(req.DressCodeDescripcion) ? null : req.DressCodeDescripcion.Trim(),

        //        saludo = string.IsNullOrWhiteSpace(req.Saludo) ? null : req.Saludo.Trim(),
        //        mensaje_bienvenida = string.IsNullOrWhiteSpace(req.MensajeBienvenida) ? null : req.MensajeBienvenida.Trim(),
        //        notas = string.IsNullOrWhiteSpace(req.Notas) ? null : req.Notas.Trim(),

        //        fecha_alta = now,
        //        fecha_modif = null,

        //        tipo_operacion = tipoOperacion,
        //        fecha_inicio = tipoOperacion == "PROGRAMA" ? req.FechaInicio : null,
        //        fecha_fin = tipoOperacion == "PROGRAMA" ? req.FechaFin : null,

        //        es_publico = tipoOperacion == "PROGRAMA" ? true : false,
        //        modo_acceso = tipoOperacion == "PROGRAMA" ? "L" : "I",
        //        modo_asistencia = "R",

        //        id_plan = idPlanEvento,
        //        estado = estadoInicial
        //    };

        //    _context.Set<ef_eventos>().Add(evento);
        //    await _context.SaveChangesAsync();

        //    // OWNER
        //    _context.Set<ef_evento_usuarios>().Add(new ef_evento_usuarios
        //    {
        //        id_evento = evento.id_evento,
        //        id_usuario = idUsuario,
        //        id_rol = idRolOwner,
        //        fecha_alta = now,
        //        activo = true
        //    });

        //    // HISTORIAL
        //    _context.Set<ef_evento_estados_hist>().Add(new ef_evento_estados_hist
        //    {
        //        id_evento = evento.id_evento,
        //        id_usuario = idUsuario,
        //        fecha = now,
        //        estado = evento.estado,
        //        observaciones = observacionHistorial
        //    });

        //    // SOLO B2C: alta comercial inicial
        //    if (!esB2B)
        //    {
        //        if (planB2C!.codigo == "B2C_FREE")
        //        {
        //            _context.Set<ef_suscripciones>().Add(new ef_suscripciones
        //            {
        //                scope = "EVENTO",
        //                id_evento = evento.id_evento,
        //                id_plan = planB2C.id_plan,
        //                estado = "ACTIVA",
        //                auto_renueva = false,
        //                periodo = "UNICO",
        //                current_period_start = now,
        //                current_period_end = now.AddDays(7),
        //                activo = true,
        //                fecha_alta = now
        //            });
        //        }
        //        else
        //        {
        //            _context.Set<ef_pagos>().Add(new ef_pagos
        //            {
        //                id_evento = evento.id_evento,
        //                tipo = "UNICO",
        //                estado = "PENDIENTE",
        //                moneda = "ARS",
        //                importe = 0,
        //                impuestos = 0,
        //                total = 0,
        //                concepto = $"Plan {planB2C.codigo} pendiente - evento {evento.id_evento}",
        //                activo = true,
        //                fecha_alta = now
        //            });
        //        }
        //    }

        //    await _context.SaveChangesAsync();
        //    await tx.CommitAsync();

        //    return await GetEventoMioAsync(idUsuario, evento.id_evento);
        //}


        public async Task<EventoResponse> CrearEventoAsync(long idUsuario, EventoCreateRequest req)
        {
            if (req == null)
                throw new InvalidOperationException("Request inválido.");

            // ✅ NUEVO: Inferencia de Cuenta si llega en 0 o nulo (solución para fallos de binding en Front)
            if ((req.IdCuenta == null || req.IdCuenta == 0))
            {
                var cuentaAsociada = await _context.Set<ef_cuenta_usuarios>()
                    .Where(cu => cu.id_usuario == idUsuario && cu.activo == true)
                    .Select(cu => (long?)cu.id_cuenta)
                    .FirstOrDefaultAsync();

                if (cuentaAsociada != null)
                {
                    req.IdCuenta = cuentaAsociada;
                }
            }

            if (req.IdTipoEvento <= 0)
                throw new InvalidOperationException("Tipo de evento obligatorio.");

            if (req.IdIdioma <= 0)
                throw new InvalidOperationException("Idioma obligatorio.");

            short idIdioma = req.IdIdioma;

            if (string.IsNullOrWhiteSpace(req.AnfitrionesTexto))
                throw new InvalidOperationException("Anfitriones obligatorio.");

            if (req.AnfitrionesTexto.Length > 500)
                throw new InvalidOperationException("Anfitriones supera 500 caracteres.");

            // if (req.IdDressCode is null && !string.IsNullOrWhiteSpace(req.DressCodeDescripcion))
            //     throw new InvalidOperationException("No se puede indicar detalle de dress code sin seleccionar dress code.");

            bool existeIdioma = await _context.Set<ef_idiomas>()
                .AnyAsync(i => i.id_idioma == idIdioma && i.activo == true);


            if (!existeIdioma)
                throw new InvalidOperationException("El idioma no existe o está inactivo.");

            if (req.IdDressCode.HasValue)
            {
                bool existeDress = await _context.Set<ef_dress_code>()
                    .AnyAsync(d => d.id_dress_code == req.IdDressCode.Value && d.activo == true);

                if (!existeDress)
                    throw new InvalidOperationException("El dress code no existe o está inactivo.");
            }

            var tipoEvento = await _context.Set<ef_tipos_evento>()
                .AsNoTracking()
                .SingleOrDefaultAsync(t => t.id_tipo_evento == req.IdTipoEvento && t.activo == true);

            if (tipoEvento == null)
                throw new InvalidOperationException("El tipo de evento no existe o está inactivo.");

            var tipoOperacion = string.IsNullOrWhiteSpace(tipoEvento.tipo_operacion)
                ? "EVENTO"
                : tipoEvento.tipo_operacion.Trim().ToUpperInvariant();

            if (tipoOperacion != "EVENTO" && tipoOperacion != "PROGRAMA")
                throw new InvalidOperationException("El tipo de evento tiene tipo_operacion inválido.");

            if (tipoOperacion == "PROGRAMA")
            {
                if (!req.FechaInicio.HasValue || !req.FechaFin.HasValue)
                    throw new InvalidOperationException("Para programas se requiere fecha_inicio y fecha_fin.");

                if (req.FechaFin.Value < req.FechaInicio.Value)
                    throw new InvalidOperationException("fecha_fin no puede ser menor a fecha_inicio.");
            }

            var modalidad = string.IsNullOrWhiteSpace(req.Modalidad)
                ? null
                : req.Modalidad.Trim().ToUpperInvariant();

            if (modalidad != null && modalidad != "PROPIO" && modalidad != "CLIENTE")
                throw new InvalidOperationException("Modalidad inválida. Valores permitidos: PROPIO, CLIENTE.");

            bool esB2B = modalidad == "PROPIO" || modalidad == "CLIENTE";

            ef_cuentas cuenta = null;
            ef_planes planB2C = null;

            // =====================================================
            // VALIDACIONES B2C / B2B
            // =====================================================

            if (!esB2B)
            {
                // B2C
                if (req.IdUnidad.HasValue)
                    throw new InvalidOperationException("No corresponde informar unidad en un evento B2C.");

                if (req.IdCliente.HasValue)
                    throw new InvalidOperationException("No corresponde informar cliente en un evento B2C.");

                
                var codigoPlan = string.IsNullOrWhiteSpace(req.CodigoPlan)
                    ? "B2C_FREE"
                    : req.CodigoPlan.Trim();

                planB2C = await _context.Set<ef_planes>()
                    .SingleOrDefaultAsync(p =>
                        p.codigo == codigoPlan &&
                        p.activo == true &&
                        p.tipo == "B2C");

                if (planB2C == null)
                    throw new InvalidOperationException("El plan seleccionado no existe o está inactivo.");

                // ✅ Anti-abuso: máximo trials activos por usuario (basado en ef_plan_limites)
                var helperPlan = new PlanLimitesHelper(_context);
                int? maxTrials = await helperPlan.GetLimiteIntByPlanAsync(planB2C.id_plan, "MAX_TRIAL_EVENTOS_ACTIVOS");
                int maxTrialsFinal = (maxTrials.HasValue && maxTrials.Value > 0) ? maxTrials.Value : 1;

                // Contar trials activos del usuario (suscripción vigente)
                var nowUtc = DateTimeOffset.UtcNow;

                var trialsActivos = await (
                    from s in _context.Set<ef_suscripciones>().AsNoTracking()
                    join eu in _context.Set<ef_evento_usuarios>().AsNoTracking()
                        on s.id_evento equals eu.id_evento
                    join ev in _context.Set<ef_eventos>().AsNoTracking()
                        on s.id_evento equals ev.id_evento
                    where s.scope == "EVENTO"
                            && s.activo == true
                            && s.estado == "ACTIVA"
                            && s.current_period_end != null
                            && s.current_period_end > nowUtc
                            && eu.id_usuario == idUsuario
                            && eu.activo == true
                            && ev.id_cuenta == null // solo trials B2C
                    select s.id_evento
                ).Distinct().CountAsync();

                if (trialsActivos >= maxTrialsFinal)
                    throw new InvalidOperationException($"Ya tenés {trialsActivos} trial activo. Debés esperar a que venza o contratar un plan para crear otro trial.");
            }
            else
            {
                // B2B
                if (!req.IdUnidad.HasValue)
                    throw new InvalidOperationException("En B2B la unidad es obligatoria.");

                if (modalidad == "PROPIO" && req.IdCliente.HasValue)
                    throw new InvalidOperationException("Un evento B2B en modalidad PROPIO no debe informar cliente.");

                if (modalidad == "CLIENTE" && !req.IdCliente.HasValue)
                    throw new InvalidOperationException("Un evento B2B en modalidad CLIENTE debe informar cliente.");

                var cuentasUsuarioQuery =
                    from cu in _context.Set<ef_cuenta_usuarios>()
                    join c in _context.Set<ef_cuentas>() on cu.id_cuenta equals c.id_cuenta
                    where cu.id_usuario == idUsuario
                          && cu.activo == true
                          && c.estado == "A"
                    select c;

                // Si todavía el front manda IdCuenta, la usamos SOLO para validar.
                // Si no la manda, tomamos la cuenta activa del usuario.
                if (req.IdCuenta.HasValue)
                {
                    cuenta = await cuentasUsuarioQuery
                        .SingleOrDefaultAsync(c => c.id_cuenta == req.IdCuenta.Value);

                    if (cuenta == null)
                        throw new UnauthorizedAccessException("No tienes acceso a la cuenta indicada o la cuenta no está activa.");

                    if (cuenta == null)
                    {
                         // Si es SuperAdmin, cargamos la cuenta sin validar pertenencia
                         cuenta = await _context.Set<ef_cuentas>()
                            .SingleOrDefaultAsync(c => c.id_cuenta == req.IdCuenta.Value && c.estado == "A");
                         
                         if (cuenta == null)
                            throw new InvalidOperationException("La cuenta no existe o no está activa.");
                    }
                }
                else
                {
                    var cuentas = await cuentasUsuarioQuery.ToListAsync();

                    if (cuentas.Count == 0)
                        throw new InvalidOperationException("El usuario no tiene una cuenta activa.");

                    if (cuentas.Count > 1)
                        throw new InvalidOperationException("El usuario tiene más de una cuenta activa. Debe seleccionarse el contexto de cuenta.");

                    cuenta = cuentas[0];
                }

                bool unidadOk = await _context.Set<ef_cuenta_unidades>()
                    .AnyAsync(u =>
                        u.id_unidad == req.IdUnidad.Value &&
                        u.id_cuenta == cuenta.id_cuenta &&
                        u.activo == true);

                if (!unidadOk)
                    throw new InvalidOperationException("La unidad no existe, no pertenece a la cuenta o está inactiva.");

                if (req.IdCliente.HasValue)
                {
                    bool clienteOk = await _context.Set<ef_clientes>()
                        .AnyAsync(c =>
                            c.id_cliente == req.IdCliente.Value &&
                            c.id_cuenta == cuenta.id_cuenta &&
                            c.activo == true);

                    if (!clienteOk)
                        throw new InvalidOperationException("El cliente no existe, no pertenece a la cuenta o está inactivo.");

                    bool relacionExiste = await _context.Set<ef_cliente_unidades>()
                        .AnyAsync(x =>
                            x.id_cliente == req.IdCliente.Value &&
                            x.id_unidad == req.IdUnidad.Value);

                    if (!relacionExiste)
                    {
                        _context.Set<ef_cliente_unidades>().Add(new ef_cliente_unidades
                        {
                            id_cliente = req.IdCliente.Value,
                            id_unidad = req.IdUnidad.Value,
                            es_principal = false,
                            activo = true,
                            fecha_alta = DateTimeOffset.UtcNow
                        });
                    }
                }
            }

            short idRolOwner = await _context.Set<ef_roles>()
                .Where(r => r.codigo == RolesCodigo.EventOwner && r.activo == true)
                .Select(r => r.id_rol)
                .SingleAsync();

            await using var tx = await _context.Database.BeginTransactionAsync();

            var now = DateTimeOffset.UtcNow;

            string estadoInicial;
            long? idPlanEvento;
            string observacionHistorial;

            if (!esB2B)
            {
                idPlanEvento = planB2C.id_plan;

                estadoInicial = planB2C.codigo == "B2C_FREE"
                    ? EventoEstado.Activo
                    : EventoEstado.PendientePago;

                // Trial días parametrizable por plan
                var trialDias = await _context.Set<ef_plan_limites>()
                    .AsNoTracking()
                    .Where(l => l.id_plan == planB2C.id_plan
                             && l.codigo_limite == "TRIAL_DIAS"
                             && l.activo == true)
                    .Select(l => l.valor_int)
                    .FirstOrDefaultAsync();

                int trialDiasFinal = (trialDias.HasValue && trialDias.Value > 0) ? trialDias.Value : 7;

                observacionHistorial = planB2C.codigo == "B2C_FREE"
                    ? $"Creación evento (FREE) - trial {trialDiasFinal} días"
                    : $"Creación evento (plan {planB2C.codigo}) - pendiente de pago";
            }
            else
            {
                idPlanEvento = cuenta.id_plan;
                estadoInicial = EventoEstado.Borrador;
                observacionHistorial = modalidad == "CLIENTE"
                    ? "Creación evento B2B para cliente"
                    : "Creación evento B2B propio de cuenta";
            }

            var evento = new ef_eventos
            {
                id_tipo_evento = req.IdTipoEvento,
                id_idioma = idIdioma,

                id_cuenta = esB2B ? cuenta.id_cuenta : null,
                id_unidad = esB2B ? req.IdUnidad : null,
                id_cliente = esB2B ? req.IdCliente : null,

                anfitriones_texto = req.AnfitrionesTexto.Trim(),

                id_dress_code = req.IdDressCode,
                dress_code_descripcion = string.IsNullOrWhiteSpace(req.DressCodeDescripcion)
                    ? null
                    : req.DressCodeDescripcion.Trim(),

                saludo = string.IsNullOrWhiteSpace(req.Saludo) ? null : req.Saludo.Trim(),
                mensaje_bienvenida = string.IsNullOrWhiteSpace(req.MensajeBienvenida) ? null : req.MensajeBienvenida.Trim(),
                notas = string.IsNullOrWhiteSpace(req.Notas) ? null : req.Notas.Trim(),

                fecha_alta = now,
                fecha_modif = null,

                tipo_operacion = tipoOperacion,
                fecha_inicio = tipoOperacion == "PROGRAMA" ? req.FechaInicio : null,
                fecha_fin = tipoOperacion == "PROGRAMA" ? req.FechaFin : null,

                es_publico = tipoOperacion == "PROGRAMA" ? true : false,
                modo_acceso = tipoOperacion == "PROGRAMA" ? "L" : "I",
                modo_asistencia = "R",

                id_plan = idPlanEvento,
                estado = estadoInicial
            };

            _context.Set<ef_eventos>().Add(evento);
            await _context.SaveChangesAsync();

            // =====================================================
            // CREAR ACCESO DEFAULT DEL EVENTO
            // =====================================================
            var acceso = new ef_evento_accesos
            {
                id_evento = evento.id_evento,
                nombre = "General",
                orden = 1,
                activo = true,
                fecha_alta = now
            };

            _context.Set<ef_evento_accesos>().Add(acceso);
            await _context.SaveChangesAsync();

            // =====================================================
            // CREAR LINK DEFAULT DEL ACCESO (Validando límites)
            // =====================================================
            if (!idPlanEvento.HasValue) throw new InvalidOperationException("No se pudo determinar el plan del evento para validar límites.");

            var helper = new PlanLimitesHelper(_context);
            int? permitirLinks = await helper.GetLimiteIntByPlanAsync(idPlanEvento.Value, "PERMITIR_GENERAR_LINKS");
            int permitirLinksFinal = (permitirLinks.HasValue) ? permitirLinks.Value : 1;

            int? maxInv = await helper.GetLimiteIntByPlanAsync(idPlanEvento.Value, "MAX_INVITADOS");
            int maxInvFinal = (maxInv.HasValue && maxInv.Value >= 1) ? maxInv.Value : 200;

            // ✅ Link activo SOLO si el evento está ACTIVO y el plan permite links
            bool linkActivo = (estadoInicial == EventoEstado.Activo) && (permitirLinksFinal != 0);

            var link = new ef_evento_acceso_links
            {
                id_evento = evento.id_evento,
                id_acceso = acceso.id_acceso,
                titulo = "Principal",
                token = TokenUtility.Generate(64),
                max_personas_total = maxInvFinal,
                max_adultos = maxInvFinal,
                activo = linkActivo,
                fecha_alta = now
            };

            _context.Set<ef_evento_acceso_links>().Add(link);
            await _context.SaveChangesAsync();

            evento.id_acceso_default = acceso.id_acceso;
            await _context.SaveChangesAsync();

            // =====================================================
            // RELACIÓN USUARIO DUEÑO
            // =====================================================
            _context.Set<ef_evento_usuarios>().Add(new ef_evento_usuarios
            {
                id_evento = evento.id_evento,
                id_usuario = idUsuario,
                id_rol = idRolOwner,
                fecha_alta = now,
                activo = true
            });

            // =====================================================
            // HISTORIAL
            // =====================================================
            _context.Set<ef_evento_estados_hist>().Add(new ef_evento_estados_hist
            {
                id_evento = evento.id_evento,
                id_usuario = idUsuario,
                fecha = now,
                estado = evento.estado,
                observaciones = observacionHistorial
            });

            // =====================================================
            // SOLO B2C: alta comercial inicial
            // =====================================================
            if (!esB2B)
            {
                int trialDiasFinal = 7;

                if (planB2C.codigo == "B2C_FREE")
                {
                    _context.Set<ef_suscripciones>().Add(new ef_suscripciones
                    {
                        scope = "EVENTO",
                        id_evento = evento.id_evento,
                        id_plan = planB2C.id_plan,
                        estado = "ACTIVA",
                        auto_renueva = false,
                        periodo = "UNICO",
                        current_period_start = now,
                        current_period_end = now.AddDays(trialDiasFinal),
                        activo = true,
                        fecha_alta = now
                    });
                }
                else
                {
                    _context.Set<ef_pagos>().Add(new ef_pagos
                    {
                        id_evento = evento.id_evento,
                        tipo = "UNICO",
                        estado = "PENDIENTE",
                        moneda = "ARS",
                        importe = 0,
                        impuestos = 0,
                        total = 0,
                        concepto = $"Plan {planB2C.codigo} pendiente - evento {evento.id_evento}",
                        activo = true,
                        fecha_alta = now
                    });
                }
            }

            await _context.SaveChangesAsync();
            await tx.CommitAsync();

            return await GetEventoMioAsync(idUsuario, evento.id_evento);
        }


        // =========================
        // MIS EVENTOS
        // =========================
        public async Task<List<EventoResponse>> MisEventosAsync(long idUsuario)
        {
            var q =
                from eu in _context.Set<ef_evento_usuarios>()
                join evDto in QueryEventosConTipo() on eu.id_evento equals evDto.IdEvento
                where eu.id_usuario == idUsuario
                      && eu.activo == true
                      && evDto.IdCuenta == null
                select evDto;

            return await q
                .AsNoTracking()
                .OrderByDescending(x => x.FechaAlta)
                .ToListAsync();
        }

        public async Task<List<EventoResponse>> MisEventosCuentaAsync(long idUsuario, long? idUnidad = null, long? idCliente = null, string? estado = null)
        {
            var q =
                from eu in _context.Set<ef_evento_usuarios>()
                join evDto in QueryEventosConTipo() on eu.id_evento equals evDto.IdEvento
                where eu.id_usuario == idUsuario
                      && eu.activo == true
                      && evDto.IdCuenta != null
                select evDto;

            if (idUnidad.HasValue)
                q = q.Where(x => x.IdUnidad == idUnidad.Value);

            if (idCliente.HasValue)
                q = q.Where(x => x.IdCliente == idCliente.Value);

            if (!string.IsNullOrWhiteSpace(estado))
                q = q.Where(x => x.Estado == estado);

            return await q
                .AsNoTracking()
                .OrderByDescending(x => x.FechaAlta)
                .ToListAsync();
        }

        // =========================
        // GET EVENTO MÍO
        // =========================
        public async Task<EventoResponse> GetEventoMioAsync(long idUsuario, long idEvento)
        {
            bool pertenece = await _context.Set<ef_evento_usuarios>()
                .AnyAsync(eu => eu.id_usuario == idUsuario && eu.id_evento == idEvento && eu.activo == true);

            if (!pertenece)
                throw new UnauthorizedAccessException("No tienes acceso a este evento.");

            var dto = await QueryEventosConTipo()
                .AsNoTracking()
                .SingleOrDefaultAsync(e => e.IdEvento == idEvento);

            if (dto == null)
                throw new KeyNotFoundException("Evento inexistente.");

            return dto;
        }

        // =========================
        // ADMIN: LISTAR
        // =========================
        public async Task<List<EventoResponse>> AdminListarEventosAsync(string? estado = null)
        {
            var q = QueryEventosConTipo();

            if (!string.IsNullOrWhiteSpace(estado))
                q = q.Where(e => e.Estado == estado);

            return await q.AsNoTracking()
                .OrderByDescending(e => e.FechaAlta)
                .ToListAsync();
        }

        // =========================
        // ADMIN: GET
        // =========================
        public async Task<EventoResponse> AdminGetEventoAsync(long idEvento)
        {
            var dto = await QueryEventosConTipo()
                .AsNoTracking()
                .SingleOrDefaultAsync(e => e.IdEvento == idEvento);

            if (dto == null)
                throw new KeyNotFoundException("Evento inexistente.");

            return dto;
        }

        // =========================
        // ACTIVAR (ADMIN)
        // =========================
        public async Task ActivarEventoAdminAsync(long idEvento, long idUsuarioAdmin)
        {
            var ev = await _context.Set<ef_eventos>()
                .SingleOrDefaultAsync(e => e.id_evento == idEvento);

            if (ev == null)
                throw new KeyNotFoundException("Evento inexistente.");

            if (ev.estado != EventoEstado.Borrador)
                throw new InvalidOperationException("Solo se puede activar un evento en borrador.");

            var now = DateTimeOffset.UtcNow;

            ev.estado = EventoEstado.Activo;
            ev.fecha_modif = now;

            _context.Set<ef_evento_estados_hist>().Add(new ef_evento_estados_hist
            {
                id_evento = idEvento,
                id_usuario = idUsuarioAdmin,
                fecha = now,
                estado = EventoEstado.Activo,
                observaciones = "Activación manual por pago"
            });

            await _context.SaveChangesAsync();
        }

        // =========================
        // UPDATE GENERAL
        // =========================
        public async Task<EventoResponse> UpdateGeneralAsync(long idUsuario, long idEvento, EventoUpdateGeneralRequest req)
        {
            bool pertenece = await _context.Set<ef_evento_usuarios>()
                .AnyAsync(eu => eu.id_usuario == idUsuario && eu.id_evento == idEvento && eu.activo == true);

            if (!pertenece)
                throw new UnauthorizedAccessException("No tienes acceso a este evento.");

            var ev = await _context.Set<ef_eventos>()
                .SingleOrDefaultAsync(e => e.id_evento == idEvento);

            if (ev == null)
                throw new KeyNotFoundException("Evento inexistente.");

            if (req.AnfitrionesTexto != null)
            {
                if (string.IsNullOrWhiteSpace(req.AnfitrionesTexto))
                    throw new InvalidOperationException("Anfitriones no puede quedar vacío.");

                if (req.AnfitrionesTexto.Length > 500)
                    throw new InvalidOperationException("Anfitriones supera 500 caracteres.");

                ev.anfitriones_texto = req.AnfitrionesTexto.Trim();
            }

            // if (req.IdDressCode is null && !string.IsNullOrWhiteSpace(req.DressCodeDescripcion))
            //    throw new InvalidOperationException("No se puede indicar detalle de dress code sin seleccionar dress code.");

            if (req.IdDressCode.HasValue)
            {
                bool existeDress = await _context.Set<ef_dress_code>()
                    .AnyAsync(d => d.id_dress_code == req.IdDressCode.Value && d.activo == true);

                if (!existeDress)
                    throw new InvalidOperationException("El dress code no existe o está inactivo.");

                ev.id_dress_code = req.IdDressCode.Value;
                ev.dress_code_descripcion = string.IsNullOrWhiteSpace(req.DressCodeDescripcion) ? null : req.DressCodeDescripcion.Trim();
            }
            else if (req.IdDressCode == null && req.DressCodeDescripcion != null)
            {
                ev.id_dress_code = null;
                ev.dress_code_descripcion = null;
            }

            if (req.Saludo != null)
                ev.saludo = string.IsNullOrWhiteSpace(req.Saludo) ? null : req.Saludo.Trim();

            if (req.MensajeBienvenida != null)
                ev.mensaje_bienvenida = string.IsNullOrWhiteSpace(req.MensajeBienvenida) ? null : req.MensajeBienvenida.Trim();

            if (req.Notas != null)
                ev.notas = string.IsNullOrWhiteSpace(req.Notas) ? null : req.Notas.Trim();

            ev.fecha_modif = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();

            // devolver enriquecido
            return await GetEventoMioAsync(idUsuario, idEvento);
        }

        public async Task<EventoResponse> UpdateConfiguracionAsync(long idUsuario, long idEvento, EventoUpdateConfiguracionRequest req)
        {
            bool pertenece = await _context.Set<ef_evento_usuarios>()
                .AnyAsync(eu => eu.id_usuario == idUsuario && eu.id_evento == idEvento && eu.activo == true);

            if (!pertenece)
                throw new UnauthorizedAccessException("No tienes acceso a este evento.");

            var ev = await _context.Set<ef_eventos>()
                .SingleOrDefaultAsync(e => e.id_evento == idEvento);

            if (ev == null)
                throw new KeyNotFoundException("Evento inexistente.");

            if (string.IsNullOrWhiteSpace(req.ModoAcceso))
                throw new InvalidOperationException("modo_acceso es obligatorio.");

            if (string.IsNullOrWhiteSpace(req.ModoAsistencia))
                throw new InvalidOperationException("modo_asistencia es obligatorio.");

            var modoAcceso = req.ModoAcceso.Trim().ToUpperInvariant();
            var modoAsistencia = req.ModoAsistencia.Trim().ToUpperInvariant();

            // Ajustá estos valores a tus reglas reales
            if (modoAcceso != "I" && modoAcceso != "L")
                throw new InvalidOperationException("modo_acceso inválido. Valores permitidos: I, L.");

            if (modoAsistencia != "R" && modoAsistencia != "C")
                throw new InvalidOperationException("modo_asistencia inválido. Valores permitidos: R, C.");

            ev.es_publico = req.EsPublico;
            ev.modo_acceso = modoAcceso;
            ev.modo_asistencia = modoAsistencia;
            ev.info_publica = req.InfoPublica;
            ev.fecha_modif = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();

            return await GetEventoMioAsync(idUsuario, idEvento);
        }

        public async Task<List<MesaRestriccionesDTO>> GetReporteRestriccionesMesasAsync(long idEvento)
        {
            var mesas = await _context.ef_evento_mesas
                .AsNoTracking()
                .Include(m => m.tramo)
                .Include(m => m.mesa_invitados)
                    .ThenInclude(mi => mi.invitado)
                .Where(m => m.tramo.id_evento == idEvento && m.activo)
                .ToListAsync();

            var idsInvitados = mesas.SelectMany(m => m.mesa_invitados.Select(mi => mi.id_invitado)).Distinct().ToList();

            // Obtener las restricciones de estos invitados
            var integrantes = await (
                from i in _context.ef_rsvp_grupo_integrantes.AsNoTracking()
                join res in _context.ef_rsvp_integrante_restricciones.AsNoTracking() 
                    on i.id_rsvp_grupo_integrante equals res.id_rsvp_grupo_integrante
                join param in _context.ef_param_restricciones_alimentarias.AsNoTracking()
                    on res.id_restriccion_alim equals param.id_restriccion_alim
                // Join opcional con traducciones (usando el idioma del evento, o default si no podemos)
                // Para este reporte simplificado, usaremos el código si no hay traducción directa 
                // pero lo ideal es pasar el idIdioma.
                where idsInvitados.Contains(i.id_invitado)
                select new
                {
                    i.id_invitado,
                    param.codigo,
                    res.observaciones,
                    i.alimentacion_detalle
                }
            ).ToListAsync();

            var result = new List<MesaRestriccionesDTO>();

            foreach (var m in mesas)
            {
                var dtoMesa = new MesaRestriccionesDTO
                {
                    IdMesa = m.id_mesa,
                    NombreMesa = m.nombre,
                    Tramo = m.tramo.nombre,
                    Invitados = new List<InvitadoRestriccionReportDTO>()
                };

                foreach (var mi in m.mesa_invitados)
                {
                    var restInvitado = integrantes.Where(x => x.id_invitado == mi.id_invitado).ToList();
                    
                    if (restInvitado.Any())
                    {
                        dtoMesa.Invitados.Add(new InvitadoRestriccionReportDTO
                        {
                            IdInvitado = mi.id_invitado,
                            Nombre = mi.invitado.nombre,
                            Apellido = mi.invitado.apellido,
                            ObservacionesGenerales = restInvitado.First().alimentacion_detalle,
                            Restricciones = restInvitado.Select(r => new RestriccionReportItemDTO
                            {
                                Tipo = r.codigo,
                                Observaciones = r.observaciones
                            }).ToList()
                        });
                    }
                }

                if (dtoMesa.Invitados.Any())
                {
                    result.Add(dtoMesa);
                }
            }

            return result.OrderBy(x => x.Tramo).ThenBy(x => x.NombreMesa).ToList();
        }

        public async Task<IEnumerable<EventoStaffDTO>> GetStaffAsync(long idEvento, long idUsuarioLogger)
        {
            // Validar que el usuario logueado pertenece al evento
            bool pertenece = await _context.Set<ef_evento_usuarios>()
                .AnyAsync(x => x.id_evento == idEvento && x.id_usuario == idUsuarioLogger && x.activo == true);

            if (!pertenece)
                throw new UnauthorizedAccessException("El usuario no tiene permisos para ver el staff de este evento.");

            // 1) Staff activo (Usuarios del sistema y Personal de Cuenta)
            var activeStaff = await (
                from eu in _context.Set<ef_evento_usuarios>().AsNoTracking()
                join u in _context.Set<ef_usuarios>().AsNoTracking() on eu.id_usuario equals u.id_usuario into users
                from u in users.DefaultIfEmpty()
                join s in _context.Set<ef_staff>().AsNoTracking() on eu.id_staff equals s.id_staff into staffs
                from s in staffs.DefaultIfEmpty()
                join r in _context.Set<ef_roles>().AsNoTracking() on eu.id_rol equals r.id_rol
                where eu.id_evento == idEvento
                select new EventoStaffDTO
                {
                    IdEventoUsuario = eu.id_evento_usuario,
                    IdEvento = eu.id_evento,
                    IdUsuario = eu.id_usuario,
                    IdStaff = eu.id_staff,
                    Nombre = eu.id_staff.HasValue ? s.nombre : u.nombre,
                    Apellido = eu.id_staff.HasValue ? s.apellido : u.apellido,
                    Email = eu.id_staff.HasValue ? (s.email ?? "") : (u.email ?? ""),
                    IdRol = eu.id_rol,
                    CodigoRol = r.codigo,
                    Activo = eu.activo,
                    FechaAlta = eu.fecha_alta,
                    EsInvitacion = false,
                    CodigoAcceso = eu.id_staff.HasValue ? s.codigo : null
                }
            ).ToListAsync();

            // 2) Invitaciones pendientes (tabla ef_invitados)
            var pendingInvites = await (
                from i in _context.Set<ef_invitados>().AsNoTracking()
                join r in _context.Set<ef_roles>().AsNoTracking() on i.id_rol_staff equals r.id_rol
                where i.id_evento == idEvento && i.es_staff == true && i.activo == true && i.rsvp_estado == "P"
                select new EventoStaffDTO
                {
                    IdEventoUsuario = 0,
                    IdEvento = i.id_evento,
                    IdUsuario = null,
                    Nombre = i.nombre,
                    Apellido = i.apellido,
                    Email = i.email,
                    IdRol = i.id_rol_staff ?? (short)0,
                    CodigoRol = r.codigo,
                    Activo = true,
                    FechaAlta = i.fecha_alta,
                    EsInvitacion = true
                }
            ).ToListAsync();

            return activeStaff.Concat(pendingInvites).ToList();
        }

        public async Task<IEnumerable<object>> GetStaffCodigosAsync(long idEvento, long idUsuarioLogger)
        {
            // Validar que el usuario logueado pertenece al evento
            bool pertenece = await _context.Set<ef_evento_usuarios>()
                .AnyAsync(x => x.id_evento == idEvento && x.id_usuario == idUsuarioLogger && x.activo == true);

            if (!pertenece)
                throw new UnauthorizedAccessException("El usuario no tiene permisos para ver los códigos de staff de este evento.");

            var codes = await (
                from eu in _context.Set<ef_evento_usuarios>().AsNoTracking()
                join s in _context.Set<ef_staff>().AsNoTracking() on eu.id_staff equals s.id_staff
                join r in _context.Set<ef_roles>().AsNoTracking() on eu.id_rol equals r.id_rol
                where eu.id_evento == idEvento && eu.activo == true
                select new
                {
                    Nombre = s.nombre,
                    Apellido = s.apellido,
                    Rol = r.descripcion ?? r.codigo,
                    CodigoAcceso = s.codigo
                }
            ).ToListAsync();

            return codes;
        }

        public async Task<object> AddStaffAsync(long idEvento, AddEventoStaffRequest req, long idUsuarioLogger)
        {
            // 1) Validar evento
            var ev = await _context.Set<ef_eventos>().AsNoTracking()
                .SingleOrDefaultAsync(x => x.id_evento == idEvento);

            if (ev == null) throw new KeyNotFoundException("Evento inexistente.");

            // 2) Validar permisos (el usuario debe ser staff activo)
            bool esStaff = await _context.Set<ef_evento_usuarios>()
                .AnyAsync(x => x.id_evento == idEvento && x.id_usuario == idUsuarioLogger && x.activo == true);

            if (!esStaff) throw new UnauthorizedAccessException("No tiene permisos para agregar staff.");

            // CASO A: Asignar Personal de Cuenta (id_staff)
            if (req.IdStaff.HasValue)
            {
                var staffPool = await _context.Set<ef_staff>().AsNoTracking()
                    .FirstOrDefaultAsync(x => x.id_staff == req.IdStaff && (x.id_cuenta == ev.id_cuenta || x.id_evento == idEvento));

                if (staffPool == null) throw new KeyNotFoundException("El staff indicado no pertenece a la cuenta o al evento.");

                var existingStaff = await _context.Set<ef_evento_usuarios>()
                    .FirstOrDefaultAsync(x => x.id_evento == idEvento && x.id_staff == req.IdStaff);

                if (existingStaff != null)
                {
                    if (existingStaff.activo) throw new ArgumentException("Este miembro del staff ya está asignado al evento.");
                    existingStaff.activo = true;
                    existingStaff.id_rol = req.IdRol;
                }
                else
                {
                    existingStaff = new ef_evento_usuarios
                    {
                        id_evento = idEvento,
                        id_staff = req.IdStaff,
                        id_rol = req.IdRol,
                        activo = true,
                        fecha_alta = DateTimeOffset.UtcNow
                    };
                    _context.Set<ef_evento_usuarios>().Add(existingStaff);
                }

                await _context.SaveChangesAsync();
                var rolStaff = await _context.Set<ef_roles>().AsNoTracking().FirstAsync(x => x.id_rol == req.IdRol);

                return new EventoStaffDTO
                {
                    IdEventoUsuario = existingStaff.id_evento_usuario,
                    IdEvento = idEvento,
                    IdStaff = staffPool.id_staff,
                    Nombre = staffPool.nombre,
                    Apellido = staffPool.apellido,
                    Email = staffPool.email ?? "",
                    IdRol = existingStaff.id_rol,
                    CodigoRol = rolStaff.codigo,
                    Activo = existingStaff.activo,
                    FechaAlta = existingStaff.fecha_alta,
                    EsInvitacion = false,
                    CodigoAcceso = staffPool.codigo
                };
            }

            // CASO B: Invitar por Email (B2B o B2C invitando externos a registrarse)
            if (string.IsNullOrWhiteSpace(req.Email)) throw new ArgumentException("Debe proporcionar un Email o un IdStaff.");

            var userToAdd = await _context.Set<ef_usuarios>()
                .SingleOrDefaultAsync(x => x.email == req.Email.Trim().ToLower());

            if (userToAdd == null)
            {
                var invitacionExistente = await _context.Set<ef_invitados>()
                    .FirstOrDefaultAsync(x => x.id_evento == idEvento && x.email == req.Email.Trim().ToLower() && x.es_staff == true);

                if (invitacionExistente != null)
                    throw new ArgumentException("Ya existe una invitacion pendiente para este email en este evento.");

                var invitacion = new ef_invitados
                {
                    id_evento = idEvento,
                    nombre = string.IsNullOrWhiteSpace(req.Nombre) ? "Staff" : req.Nombre.Trim(),
                    apellido = string.IsNullOrWhiteSpace(req.Apellido) ? "Invitado" : req.Apellido.Trim(),
                    email = req.Email.Trim().ToLower(),
                    es_staff = true,
                    id_rol_staff = req.IdRol,
                    rsvp_token = Guid.NewGuid().ToString().Replace("-", ""),
                    rsvp_estado = "P",
                    activo = true,
                    fecha_alta = DateTimeOffset.UtcNow
                };

                _context.Set<ef_invitados>().Add(invitacion);
                await _context.SaveChangesAsync();

                return new
                {
                    Message = "Invitación de staff creada exitosamente.",
                    Email = invitacion.email,
                    Token = invitacion.rsvp_token,
                    EsInvitacion = true
                };
            }

            var existing = await _context.Set<ef_evento_usuarios>()
                .FirstOrDefaultAsync(x => x.id_evento == idEvento && x.id_usuario == userToAdd.id_usuario);

            if (existing != null)
            {
                if (existing.activo) throw new ArgumentException("El usuario ya es parte del staff de este evento.");
                existing.id_rol = req.IdRol;
                existing.activo = true;
                existing.fecha_modif = DateTimeOffset.UtcNow;
            }
            else
            {
                existing = new ef_evento_usuarios
                {
                    id_evento = idEvento,
                    id_usuario = userToAdd.id_usuario,
                    id_rol = req.IdRol,
                    activo = true,
                    fecha_alta = DateTimeOffset.UtcNow
                };
                _context.Set<ef_evento_usuarios>().Add(existing);
            }

            await _context.SaveChangesAsync();
            var rol = await _context.Set<ef_roles>().AsNoTracking().FirstAsync(x => x.id_rol == req.IdRol);

            return new EventoStaffDTO
            {
                IdEventoUsuario = existing.id_evento_usuario,
                IdEvento = idEvento,
                IdUsuario = userToAdd.id_usuario,
                Nombre = userToAdd.nombre,
                Apellido = userToAdd.apellido,
                Email = userToAdd.email,
                IdRol = existing.id_rol,
                CodigoRol = rol.codigo,
                Activo = existing.activo,
                FechaAlta = existing.fecha_alta,
                EsInvitacion = false
            };
        }

        public async Task<bool> UpdateStaffAsync(long idEvento, long idEventoUsuario, UpdateEventoStaffRequest req, long idUsuarioLogger)
        {
            var staffRel = await _context.Set<ef_evento_usuarios>()
                .SingleOrDefaultAsync(x => x.id_evento_usuario == idEventoUsuario && x.id_evento == idEvento);

            if (staffRel == null) throw new KeyNotFoundException("Registro de staff inexistente.");

            bool esAdmin = await _context.Set<ef_evento_usuarios>()
                .AnyAsync(x => x.id_evento == idEvento && x.id_usuario == idUsuarioLogger && x.activo == true);

            if (!esAdmin) throw new UnauthorizedAccessException("No tiene permisos para modificar staff.");

            staffRel.id_rol = req.IdRol;
            staffRel.activo = req.Activo;
            staffRel.fecha_modif = DateTimeOffset.UtcNow;

            // Si es personal de cuenta o evento (ef_staff), verificamos si es exclusivo del evento (B2C) para actualizar datos.
            if (staffRel.id_staff.HasValue)
            {
                var staffEntity = await _context.Set<ef_staff>().SingleOrDefaultAsync(x => x.id_staff == staffRel.id_staff);
                if (staffEntity != null && staffEntity.id_cuenta == null && staffEntity.id_evento == idEvento)
                {
                    // Es B2C, permitimos editar su nombre y email también.
                    if (!string.IsNullOrWhiteSpace(req.Nombre)) staffEntity.nombre = req.Nombre.Trim();
                    if (!string.IsNullOrWhiteSpace(req.Apellido)) staffEntity.apellido = req.Apellido.Trim();
                    if (!string.IsNullOrWhiteSpace(req.Email)) staffEntity.email = req.Email.Trim();
                    staffEntity.id_rol = req.IdRol; // Mantenemos el rol base sincronizado
                    staffEntity.activo = req.Activo; // Si se inactiva del evento, se inactiva el código
                    staffEntity.fecha_modif = DateTimeOffset.UtcNow;
                }
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteStaffAsync(long idEvento, long idEventoUsuario, long idUsuarioLogger)
        {
            var staffRel = await _context.Set<ef_evento_usuarios>()
                .SingleOrDefaultAsync(x => x.id_evento_usuario == idEventoUsuario && x.id_evento == idEvento);

            if (staffRel == null) throw new KeyNotFoundException("Registro de staff inexistente.");

            bool esAdmin = await _context.Set<ef_evento_usuarios>()
                .AnyAsync(x => x.id_evento == idEvento && x.id_usuario == idUsuarioLogger && x.activo == true);

            if (!esAdmin) throw new UnauthorizedAccessException("No tiene permisos para eliminar staff.");

            staffRel.activo = false;
            staffRel.fecha_modif = DateTimeOffset.UtcNow;
            
            if (staffRel.id_staff.HasValue)
            {
                var staffEntity = await _context.Set<ef_staff>().SingleOrDefaultAsync(x => x.id_staff == staffRel.id_staff);
                if (staffEntity != null && staffEntity.id_cuenta == null && staffEntity.id_evento == idEvento)
                {
                    // Es exclusivo de B2C, matamos el código
                    staffEntity.activo = false;
                    staffEntity.fecha_modif = DateTimeOffset.UtcNow;
                }
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<object> AceptarInvitacionStaffAsync(string token, long idUsuarioActual)
        {
            var invite = await _context.Set<ef_invitados>()
                .FirstOrDefaultAsync(x => x.rsvp_token == token && x.es_staff == true && x.rsvp_estado == "P" && x.activo == true);

            if (invite == null) throw new KeyNotFoundException("Invitacin invlida o ya procesada.");

            var user = await _context.Set<ef_usuarios>().AsNoTracking()
                .SingleOrDefaultAsync(x => x.id_usuario == idUsuarioActual);

            if (user == null) throw new UnauthorizedAccessException("Usuario no encontrado.");

            // 1) Vincular al evento
            var rel = await _context.Set<ef_evento_usuarios>()
                .FirstOrDefaultAsync(x => x.id_evento == invite.id_evento && x.id_usuario == idUsuarioActual);

            if (rel == null)
            {
                rel = new ef_evento_usuarios
                {
                    id_evento = invite.id_evento,
                    id_usuario = idUsuarioActual,
                    id_rol = invite.id_rol_staff ?? (short)0,
                    activo = true,
                    fecha_alta = DateTimeOffset.UtcNow
                };
                _context.Set<ef_evento_usuarios>().Add(rel);
            }
            else
            {
                rel.activo = true;
                rel.id_rol = invite.id_rol_staff ?? rel.id_rol;
                rel.fecha_modif = DateTimeOffset.UtcNow;
            }

            // 2) Marcar invitacin como aceptada
            invite.rsvp_estado = "Y";
            invite.fecha_rsvp = DateTimeOffset.UtcNow;
            invite.activo = false; // La "sacamos" de la tabla de invitados para staff

            await _context.SaveChangesAsync();

            return new { ok = true, id_evento = invite.id_evento };
        }
    }
}
