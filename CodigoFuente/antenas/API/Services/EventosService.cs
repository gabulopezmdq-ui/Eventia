using API.DataSchema;
using API.DataSchema.DTO;
using API.Domain;
using API.Utility;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

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
        public async Task<EventoResponse> CrearEventoAsync(long idUsuario, EventoCreateRequest req)
        {
            if (req.IdTipoEvento <= 0)
                throw new InvalidOperationException("Tipo de evento obligatorio.");

            if (req.IdIdioma <= 0)
                throw new InvalidOperationException("Idioma obligatorio.");

            if (string.IsNullOrWhiteSpace(req.AnfitrionesTexto))
                throw new InvalidOperationException("Anfitriones obligatorio.");

            if (req.AnfitrionesTexto.Length > 500)
                throw new InvalidOperationException("Anfitriones supera 500 caracteres.");

            if (req.IdDressCode is null && !string.IsNullOrWhiteSpace(req.DressCodeDescripcion))
                throw new InvalidOperationException("No se puede indicar detalle de dress code sin seleccionar dress code.");

            bool existeTipo = await _context.Set<ef_tipos_evento>()
                .AnyAsync(t => t.id_tipo_evento == req.IdTipoEvento && t.activo == true);

            if (!existeTipo)
                throw new InvalidOperationException("El tipo de evento no existe o está inactivo.");

            bool existeIdioma = await _context.Set<ef_idiomas>()
                .AnyAsync(i => i.id_idioma == req.IdIdioma && i.activo == true);

            if (!existeIdioma)
                throw new InvalidOperationException("El idioma no existe o está inactivo.");

            if (req.IdDressCode.HasValue)
            {
                bool existeDress = await _context.Set<ef_dress_code>()
                    .AnyAsync(d => d.id_dress_code == req.IdDressCode.Value && d.activo == true);

                if (!existeDress)
                    throw new InvalidOperationException("El dress code no existe o está inactivo.");
            }

            bool esB2B = req.IdCuenta.HasValue;

            if (!string.IsNullOrWhiteSpace(req.Modalidad))
            {
                var modalidad = req.Modalidad.Trim().ToUpperInvariant();
                if (modalidad != "PROPIO" && modalidad != "CLIENTE")
                    throw new InvalidOperationException("Modalidad inválida. Valores permitidos: PROPIO, CLIENTE.");
            }

            ef_cuentas? cuenta = null;
            ef_cuenta_unidades? unidad = null;
            ef_clientes? cliente = null;

            ef_planes? planB2C = null;

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

                bool yaTieneBorrador = await _context.Set<ef_evento_usuarios>()
                    .AnyAsync(eu =>
                        eu.id_usuario == idUsuario &&
                        eu.activo == true &&
                        _context.Set<ef_eventos>().Any(ev => ev.id_evento == eu.id_evento && ev.estado == EventoEstado.Borrador));

                if (yaTieneBorrador)
                    throw new InvalidOperationException("Ya tienes un evento en borrador. Activa o elimina ese evento para crear otro.");

                var codigoPlan = string.IsNullOrWhiteSpace(req.CodigoPlan) ? "B2C_FREE" : req.CodigoPlan.Trim();

                planB2C = await _context.Set<ef_planes>()
                    .SingleOrDefaultAsync(p => p.codigo == codigoPlan && p.activo == true && p.tipo == "B2C");

                if (planB2C == null)
                    throw new InvalidOperationException("El plan seleccionado no existe o está inactivo.");
            }
            else
            {
                // B2B
                if (!req.IdUnidad.HasValue)
                    throw new InvalidOperationException("En B2B la unidad es obligatoria.");

                var modalidad = (req.Modalidad ?? string.Empty).Trim().ToUpperInvariant();

                if (modalidad == "PROPIO" && req.IdCliente.HasValue)
                    throw new InvalidOperationException("Un evento B2B en modalidad PROPIO no debe informar cliente.");

                if (modalidad == "CLIENTE" && !req.IdCliente.HasValue)
                    throw new InvalidOperationException("Un evento B2B en modalidad CLIENTE debe informar cliente.");

                // validar cuenta del usuario
                var cuentaUsuario = await _context.Set<ef_cuenta_usuarios>()
                    .AsNoTracking()
                    .AnyAsync(cu => cu.id_cuenta == req.IdCuenta.Value && cu.id_usuario == idUsuario && cu.activo == true);

                if (!cuentaUsuario)
                    throw new UnauthorizedAccessException("No tienes acceso a la cuenta indicada.");

                cuenta = await _context.Set<ef_cuentas>()
                    .SingleOrDefaultAsync(c => c.id_cuenta == req.IdCuenta.Value && c.estado == "A");

                if (cuenta == null)
                    throw new InvalidOperationException("La cuenta no existe o no está activa.");

                unidad = await _context.Set<ef_cuenta_unidades>()
                    .SingleOrDefaultAsync(u => u.id_unidad == req.IdUnidad.Value && u.id_cuenta == req.IdCuenta.Value && u.activo == true);

                if (unidad == null)
                    throw new InvalidOperationException("La unidad no existe, no pertenece a la cuenta o está inactiva.");

                if (req.IdCliente.HasValue)
                {
                    cliente = await _context.Set<ef_clientes>()
                        .SingleOrDefaultAsync(c =>
                            c.id_cliente == req.IdCliente.Value &&
                            c.id_cuenta == req.IdCuenta.Value &&
                            c.activo == true);

                    if (cliente == null)
                        throw new InvalidOperationException("El cliente no existe, no pertenece a la cuenta o está inactivo.");

                    bool relacionExiste = await _context.Set<ef_cliente_unidades>()
                        .AnyAsync(x => x.id_cliente == req.IdCliente.Value && x.id_unidad == req.IdUnidad.Value);

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

                // En B2B, el plan se toma de la cuenta; no del request
                req.CodigoPlan = null;
            }

            short idRolOwner = await _context.Set<ef_roles>()
                .Where(r => r.codigo == RolesCodigo.EventOwner && r.activo == true)
                .Select(r => r.id_rol)
                .SingleAsync();

            await using var tx = await _context.Database.BeginTransactionAsync();

            var now = DateTimeOffset.UtcNow;

            string estadoInicial;
            long? idPlanEvento = null;
            string observacionHistorial;

            if (!esB2B)
            {
                idPlanEvento = planB2C!.id_plan;
                estadoInicial = (planB2C.codigo == "B2C_FREE")
                    ? EventoEstado.Borrador
                    : EventoEstado.PendientePago;

                observacionHistorial = (planB2C.codigo == "B2C_FREE")
                    ? "Creación evento (FREE) - trial 7 días"
                    : $"Creación evento (plan {planB2C.codigo}) - pendiente de pago";
            }
            else
            {
                // B2B: el plan vive en la cuenta, no en el evento
                idPlanEvento = cuenta!.id_plan;
                estadoInicial = EventoEstado.Borrador;
                observacionHistorial = "Creación evento B2B";
            }

            var evento = new ef_eventos
            {
                id_tipo_evento = req.IdTipoEvento,
                id_idioma = req.IdIdioma,

                id_cuenta = esB2B ? req.IdCuenta : null,
                id_unidad = esB2B ? req.IdUnidad : null,
                id_cliente = esB2B ? req.IdCliente : null,

                anfitriones_texto = req.AnfitrionesTexto.Trim(),
                id_dress_code = req.IdDressCode,
                dress_code_descripcion = string.IsNullOrWhiteSpace(req.DressCodeDescripcion) ? null : req.DressCodeDescripcion.Trim(),

                saludo = string.IsNullOrWhiteSpace(req.Saludo) ? null : req.Saludo.Trim(),
                mensaje_bienvenida = string.IsNullOrWhiteSpace(req.MensajeBienvenida) ? null : req.MensajeBienvenida.Trim(),
                notas = string.IsNullOrWhiteSpace(req.Notas) ? null : req.Notas.Trim(),

                fecha_alta = now,
                fecha_modif = null,

                es_publico = false,
                modo_acceso = "I",
                modo_asistencia = "R",

                id_plan = idPlanEvento,
                estado = estadoInicial
            };

            _context.Set<ef_eventos>().Add(evento);
            await _context.SaveChangesAsync();

            // OWNER
            _context.Set<ef_evento_usuarios>().Add(new ef_evento_usuarios
            {
                id_evento = evento.id_evento,
                id_usuario = idUsuario,
                id_rol = idRolOwner,
                fecha_alta = now,
                activo = true
            });

            // HISTORIAL
            _context.Set<ef_evento_estados_hist>().Add(new ef_evento_estados_hist
            {
                id_evento = evento.id_evento,
                id_usuario = idUsuario,
                fecha = now,
                estado = evento.estado,
                observaciones = observacionHistorial
            });

            // SOLO B2C: alta comercial inicial
            if (!esB2B)
            {
                if (planB2C!.codigo == "B2C_FREE")
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
                        current_period_end = now.AddDays(7),
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

            if (req.IdDressCode is null && !string.IsNullOrWhiteSpace(req.DressCodeDescripcion))
                throw new InvalidOperationException("No se puede indicar detalle de dress code sin seleccionar dress code.");

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
            ev.fecha_modif = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();

            return await GetEventoMioAsync(idUsuario, idEvento);
        }

    }
}