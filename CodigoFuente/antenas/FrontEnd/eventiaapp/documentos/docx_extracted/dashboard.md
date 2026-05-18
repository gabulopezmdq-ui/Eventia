Eventia – Programas / Eventos
PORTAL DEL PARTICIPANTE


🧠 CONCEPTO FINAL
Portal del participante (único)

Entrada:
- Programa → token_consulta (inscripción)
- Evento privado → rsvp_token
- Evento público → token de acceso

Hoy cerramos:
✔ Portal de PROGRAMAS (padre / familia)
________________________________________
🔐 1. ACCESO DEL PADRE (CLAVE)
Ya lo tenés casi resuelto, solo hay que formalizarlo bien.
✔ Tabla existente
ef_programa_inscripciones.token_consulta
✔ Regla
Se genera en:
POST confirmar inscripción
✔ Cambios necesarios
Asegurarte de esto en confirmación:
if (string.IsNullOrWhiteSpace(insc.token_consulta))
{
    insc.token_consulta = Guid.NewGuid().ToString("N");
}
✔ 64 chars aprox → OK
________________________________________
✔ Respuesta final de inscripción
MODIFICAR:
public class ProgramaInscripcionConfirmarResponse
AGREGAR:
[JsonPropertyName("url_portal")]
public string UrlPortal { get; set; } = null!;
Y en el controller:
UrlPortal = $"{_config["App:PublicBaseUrl"]}/programas/portal/{insc.token_consulta}"
________________________________________
✔ Resultado final para el padre
{
  "ok": true,
  "id_inscripcion": 12,
  "token_consulta": "abc123",
  "url_portal": "https://eventia.app/programas/portal/abc123"
}
👉 LISTO.
No hay login, no hay app, no hay fricción.
________________________________________
🗄️ 2. TABLAS NUEVAS (solo 2)
✔ Portal secciones (ya lo tenés)
✔ Fotos
create table public.ef_evento_portal_fotos (
  id_portal_foto bigint generated always as identity primary key,
  id_evento bigint not null,
  titulo varchar(120),
  descripcion varchar(300),
  url_foto varchar(600) not null,
  fecha_foto date,
  visible_portal boolean default true,
  activo boolean default true,
  fecha_alta timestamptz default now()
);
________________________________________
🧾 3. ENDPOINT PRINCIPAL (PORTAL)
GET /programas/portal/{tokenConsulta}
________________________________________
📦 4. RESPONSE COMPLETO FINAL
{
  "tipoPortal": "PROGRAMA",
  "programa": {
    "titulo": "Casal Aquamar 2026",
    "mensajeBienvenida": "Bienvenidos al casal"
  },
  "responsable": {
    "nombreCompleto": "Mireia Pons",
    "email": "mireia@test.com",
    "telefono": "+34600777111"
  },
  "pago": {
    "totalOriginal": 343,
    "totalPagado": 100,
    "saldo": 243,
    "moneda": "EUR",
    "estadoPago": "PARCIAL"
  },
  "participantes": [
    {
      "nombreCompleto": "Nil Pons",
      "periodos": ["Semana 1"],
      "servicios": ["Comedor"],
      "tieneRestricciones": true,
      "tieneSaludCargada": true
    }
  ],
  "qrsRetiro": [
    {
      "nombreAutorizado": "Marta Puig",
      "qrToken": "qr_123",
      "participantes": ["Nil Pons"]
    }
  ],
  "retiros": [
    {
      "participante": "Nil Pons",
      "nombreRetirador": "Marta Puig",
      "fechaRetiro": "2026-06-24T17:00:00"
    }
  ],
  "saludAcciones": [
    {
      "participante": "Nil Pons",
      "fechaHora": "2026-06-24T14:30:00",
      "tipoAccion": "INCIDENTE",
      "descripcion": "Dolor de cabeza",
      "contactoRealizado": true
    }
  ],
  "fotos": [
    {
      "titulo": "Piscina",
      "urlFoto": "https://...",
      "fechaFoto": "2026-06-24"
    }
  ],
  "secciones": [
    { "codigo": "RESUMEN", "visible": true },
    { "codigo": "PAGOS", "visible": true },
    { "codigo": "QRS_RETIRO", "visible": true },
    { "codigo": "RETIROS", "visible": true },
    { "codigo": "SALUD_ACCIONES", "visible": true },
    { "codigo": "FOTOS", "visible": true }
  ]
}
________________________________________
🖥️ 5. PANTALLAS (FRONT)
🏠 HOME PORTAL
Casal Aquamar

Mireia Pons
📧 mireia@test.com
📞 +34...

Estado:
✔ Inscripción confirmada

Pago:
💰 Total: 343
💳 Pagado: 100
⚠ Saldo: 243
________________________________________
👦 PARTICIPANTES
Nil Pons

📅 Semana 1
🍽 Comedor

⚠ Restricciones alimentarias
🩺 Ficha de salud cargada
________________________________________
📲 QR RETIRO
Marta Puig
QR: [imagen]

Puede retirar:
- Nil Pons
________________________________________
🚶 RETIROS
24/06
Nil Pons
Retirado por Marta Puig
17:00 hs
________________________________________
🩺 SALUD / INCIDENTES
Nil Pons
24/06 14:30

INCIDENTE
Dolor de cabeza

✔ Se contactó a la familia
________________________________________
📸 FOTOS
[foto]

Piscina
24/06
________________________________________
🧠 6. REGLAS IMPORTANTES
🔹 El padre SOLO ve:
Su inscripción
Sus hijos
Sus datos
________________________________________
🔹 NO ve:
Otros niños
Otros padres
Datos globales
________________________________________
🔹 Seguridad
Token = acceso total
NO necesita login
NO necesita cuenta
________________________________________
🔥 7. QUÉ YA QUEDA CERRADO
✔ Inscripción completa
✔ Pagos
✔ Cocina
✔ Transporte
✔ Retiros
✔ Salud operativa
✔ Portal del padre
✔ Fotos
________________________________________
🧨 8. QUÉ NO TOCAR MÁS
No vuelvas a tocar:
estructura inscripción
modelo pagos
modelo salud
modelo autorizaciones
Ya está bien armado.
________________________________________
🚀 9. PRÓXIMO NIVEL (NO AHORA)
Notificaciones push/email
Portal eventos (boda/tardeo)
App staff
Dashboard analytics
________________________________________
🧠 RESUMEN FINAL
Esto que acabás de cerrar es MUY fuerte:
No es un formulario
No es una app de eventos
No es un sistema de inscripción

Es un sistema operativo completo del programa + CRM + portal familiar



🧠 BLOQUE 1 — ARQUITECTURA FINAL DEL PORTAL
🎯 Objetivo
Un único sistema:
PORTAL DEL PARTICIPANTE
que sirve para:
✔ Programas (casal, clínica, etc)
✔ Eventos privados (boda)
✔ Eventos públicos (tardeo)
________________________________________
🔐 1. ACCESO (CRÍTICO — esto define todo)
✔ Tipos de entrada
Tipo	Token	Tabla
Programa	token_consulta	ef_programa_inscripciones
Evento privado	rsvp_token	ef_invitados
Evento público	token	ef_evento_acceso_links
________________________________________
✔ Endpoint único (recomendado)
GET /portal/{token}
👉 El backend detecta qué tipo es.
________________________________________
✔ Lógica
if (token pertenece a programa_inscripciones)
    → PORTAL_PROGRAMA

else if (token pertenece a invitados.rsvp_token)
    → PORTAL_EVENTO_PRIVADO

else if (token pertenece a acceso_links.token)
    → PORTAL_EVENTO_PUBLICO
________________________________________
🧩 2. SECCIONES DEL PORTAL (MODELO DEFINITIVO)
✔ Tabla paramétrica
ef_param_portal_secciones
Códigos finales:
RESUMEN
AGENDA
PARTICIPANTES
PAGOS
QRS_RETIRO
RETIROS
SALUD
SALUD_ACCIONES
AUTORIZACIONES
NOVEDADES
FOTOS
ALBUM
MUSICA
HOSPEDAJES
REGALOS
ACCESO_BENEFICIO
QR_INGRESO
________________________________________
✔ Configuración por evento
ef_evento_portal_config
👉 controla:
qué se ve
orden
nombre
________________________________________
✔ Ejemplo casal
RESUMEN
PARTICIPANTES
PAGOS
QRS_RETIRO
RETIROS
SALUD
SALUD_ACCIONES
FOTOS
________________________________________
✔ Ejemplo boda
RESUMEN
AGENDA
MUSICA
ALBUM
REGALOS
HOSPEDAJES
________________________________________
✔ Ejemplo tardeo
RESUMEN
ACCESO_BENEFICIO
QR_INGRESO
FOTOS
________________________________________
🧾 3. DTO BASE FINAL (UNIFICADO)
Este es CLAVE. No lo cambies más.
public class PortalPublicoDTO
{
    public string TipoPortal { get; set; } = null!;

    public long IdEvento { get; set; }

    public PortalEventoDTO Evento { get; set; } = new();

    public PortalUsuarioDTO Usuario { get; set; } = new();

    public PortalPagoDTO? Pago { get; set; }

    public List<PortalSeccionDTO> Secciones { get; set; } = new();

    public object Data { get; set; } = new(); // contenido dinámico
}
________________________________________
🧠 4. ESTRUCTURA DE DATA (IMPORTANTE)
NO devuelvas mil campos sueltos.
Agrupá:
{
  "data": {
    "participantes": [],
    "pagos": {},
    "retiros": [],
    "salud": [],
    "fotos": []
  }
}
👉 Esto hace que el front sea limpio.
________________________________________
📸 5. FOTOS — DECISIÓN FINAL
✔ SÍ → tabla nueva
👉 porque:
✔ no dependen de QR
✔ son internas (staff)
✔ pueden ser privadas por portal
✔ distinto concepto al álbum de boda
👉 Bien separado:
ef_evento_portal_fotos → programas / uso operativo
ef_evento_album → eventos sociales
________________________________________
🧠 6. SALUD ACCIONES (CLAVE DEL VALOR)
Esto ya lo tenés:
ef_programa_salud_acciones
👉 El portal SOLO muestra:
acciones del hijo del padre
NO todo.
________________________________________
🧭 7. FLUJO COMPLETO
Programa
Inscripción
→ genera token_consulta
→ padre entra al portal
→ ve:
    pagos
    hijos
    QR
    retiros
    salud
    fotos
________________________________________
Boda
Invitación
→ rsvp_token
→ invitado entra
→ ve:
    agenda
    música
    álbum
________________________________________
Tardeo
Registro público
→ token acceso
→ usuario entra
→ ve:
    beneficio
    QR ingreso
________________________________________
🔥 8. LO MÁS IMPORTANTE
El portal NO es un módulo aparte.
Es una capa de visualización de lo que ya tenés
________________________________________
🚨 SIGUIENTE BLOQUE
En el próximo te paso:
🔧 BLOQUE 2
✔ Controller completo /portal/{token}
✔ detección de tipo
✔ armado de respuesta
✔ código real listo para copiar
Después:
🔧 BLOQUE 3
✔ Entities faltantes
✔ configurations
🔧 BLOQUE 4
✔ endpoints admin (config portal, fotos)
🔧 BLOQUE 5
✔ pantallas front + UX completa



BLOQUE 2 — Controller público /portal/{token}
Este bloque arma el endpoint único:
GET /portal/{token}?idIdioma=1
Detecta si el token pertenece a:
1. Programa → ef_programa_inscripciones.token_consulta
2. Evento privado → ef_invitados.rsvp_token
3. Evento público → ef_evento_acceso_links.token
________________________________________
1. DTOs base
Archivo:
DataSchema/DTO/Portal/PortalPublicoDTO.cs
using System;
using System.Collections.Generic;

namespace API.DataSchema.DTO.Portal
{
    public class PortalPublicoDTO
    {
        public string TipoPortal { get; set; } = "";
        public long IdEvento { get; set; }

        public PortalEventoDTO Evento { get; set; } = new();
        public PortalUsuarioDTO Usuario { get; set; } = new();

        public List<PortalSeccionDTO> Secciones { get; set; } = new();

        public PortalProgramaDataDTO? ProgramaData { get; set; }
        public PortalEventoPrivadoDataDTO? EventoPrivadoData { get; set; }
        public PortalEventoPublicoDataDTO? EventoPublicoData { get; set; }
    }

    public class PortalEventoDTO
    {
        public string Titulo { get; set; } = "";
        public string? MensajeBienvenida { get; set; }
        public string? AnfitrionesTexto { get; set; }
        public DateTimeOffset? FechaEvento { get; set; }
        public DateOnly? FechaInicio { get; set; }
        public DateOnly? FechaFin { get; set; }
        public string TipoOperacion { get; set; } = "";
    }

    public class PortalUsuarioDTO
    {
        public string NombreVisible { get; set; } = "";
        public string? Email { get; set; }
        public string? Telefono { get; set; }
    }

    public class PortalSeccionDTO
    {
        public string Codigo { get; set; } = "";
        public string Titulo { get; set; } = "";
        public bool Visible { get; set; }
        public short Orden { get; set; }
        public string? ConfigJson { get; set; }
    }

    public class PortalProgramaDataDTO
    {
        public long IdInscripcion { get; set; }
        public long? IdRsvpGrupo { get; set; }

        public PortalPagoDTO Pago { get; set; } = new();

        public List<PortalProgramaParticipanteDTO> Participantes { get; set; } = new();
        public List<PortalQrRetiroDTO> QrsRetiro { get; set; } = new();
        public List<PortalRetiroDTO> Retiros { get; set; } = new();
        public List<PortalSaludAccionDTO> SaludAcciones { get; set; } = new();
        public List<PortalFotoDTO> Fotos { get; set; } = new();
    }

    public class PortalPagoDTO
    {
        public decimal TotalOriginal { get; set; }
        public decimal TotalPagado { get; set; }
        public decimal Saldo { get; set; }
        public string Moneda { get; set; } = "";
        public string EstadoPago { get; set; } = "";
    }

    public class PortalProgramaParticipanteDTO
    {
        public long IdInvitado { get; set; }
        public long IdRsvpGrupoIntegrante { get; set; }
        public string NombreCompleto { get; set; } = "";
        public List<string> Periodos { get; set; } = new();
        public List<string> Servicios { get; set; } = new();
        public bool TieneRestricciones { get; set; }
        public bool TieneSaludCargada { get; set; }
    }

    public class PortalQrRetiroDTO
    {
        public string NombreAutorizado { get; set; } = "";
        public string? TelefonoAutorizado { get; set; }
        public string? Relacion { get; set; }
        public string QrToken { get; set; } = "";
        public List<string> Participantes { get; set; } = new();
    }

    public class PortalRetiroDTO
    {
        public long IdRetiro { get; set; }
        public string Participante { get; set; } = "";
        public string NombreRetirador { get; set; } = "";
        public DateTimeOffset FechaRetiro { get; set; }
        public DateOnly FechaOperativa { get; set; }
    }

    public class PortalSaludAccionDTO
    {
        public long IdAccionSalud { get; set; }
        public long IdParticipante { get; set; }
        public string Participante { get; set; } = "";
        public DateTimeOffset FechaHora { get; set; }
        public string TipoAccion { get; set; } = "";
        public string Descripcion { get; set; } = "";
        public bool RequirioContactoFamilia { get; set; }
        public bool ContactoRealizado { get; set; }
        public bool RequiereSeguimiento { get; set; }
    }

    public class PortalFotoDTO
    {
        public long IdPortalFoto { get; set; }
        public string? Titulo { get; set; }
        public string? Descripcion { get; set; }
        public string UrlFoto { get; set; } = "";
        public DateOnly? FechaFoto { get; set; }
    }

    public class PortalEventoPrivadoDataDTO
    {
        public long IdInvitado { get; set; }
        public string RsvpEstado { get; set; } = "";
        public string? RsvpMensaje { get; set; }
        public string? QrToken { get; set; }

        public List<PortalAgendaItemDTO> Agenda { get; set; } = new();
        public List<PortalFotoDTO> Fotos { get; set; } = new();
    }

    public class PortalEventoPublicoDataDTO
    {
        public long IdAccesoLink { get; set; }
        public string TituloCampania { get; set; } = "";
        public string? LeyendaPublica { get; set; }
        public string? BeneficioTitulo { get; set; }
        public string? BeneficioDescripcion { get; set; }
        public DateTimeOffset? BeneficioHasta { get; set; }
        public string? MensajePostRegistro { get; set; }
        public List<PortalFotoDTO> Fotos { get; set; } = new();
    }

    public class PortalAgendaItemDTO
    {
        public long IdTramo { get; set; }
        public string Nombre { get; set; } = "";
        public DateTimeOffset? FechaHoraInicio { get; set; }
        public DateTimeOffset? FechaHoraFin { get; set; }
        public string? Lugar { get; set; }
    }
}
________________________________________
2. Controller único
Archivo:
Controllers/Portal/portalController.cs
using API.DataSchema;
using API.DataSchema.DTO.Portal;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers.Portal
{
    [ApiController]
    [Route("portal")]
    public class portalController : ControllerBase
    {
        private readonly DataContext _context;

        public portalController(DataContext context)
        {
            _context = context;
        }

        [HttpGet("{token}")]
        public async Task<ActionResult<PortalPublicoDTO>> GetPortal(
            string token,
            [FromQuery] short idIdioma = 1)
        {
            if (string.IsNullOrWhiteSpace(token))
                return BadRequest("Token inválido.");

            token = token.Trim();

            var programa = await _context.Set<ef_programa_inscripciones>()
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.token_consulta == token && x.activo == true);

            if (programa != null)
                return Ok(await ArmarPortalProgramaAsync(programa, idIdioma));

            var invitado = await _context.Set<ef_invitados>()
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.rsvp_token == token && x.activo == true);

            if (invitado != null)
                return Ok(await ArmarPortalEventoPrivadoAsync(invitado, idIdioma));

            var accesoLink = await _context.Set<ef_evento_acceso_links>()
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.token == token && x.activo == true);

            if (accesoLink != null)
                return Ok(await ArmarPortalEventoPublicoAsync(accesoLink, idIdioma));

            return NotFound("Portal no encontrado o token inválido.");
        }

        private async Task<PortalPublicoDTO> ArmarPortalProgramaAsync(
            ef_programa_inscripciones insc,
            short idIdioma)
        {
            var evento = await _context.Set<ef_eventos>()
                .AsNoTracking()
                .SingleAsync(x => x.id_evento == insc.id_evento);

            var secciones = await GetSeccionesPortalAsync(evento);

            var participantesBase = await (
                from gi in _context.Set<ef_rsvp_grupo_integrantes>().AsNoTracking()
                join inv in _context.Set<ef_invitados>().AsNoTracking()
                    on gi.id_invitado equals inv.id_invitado
                where gi.id_rsvp_grupo == insc.id_rsvp_grupo
                      && gi.requiere_asistencia == true
                      && inv.activo == true
                orderby inv.apellido, inv.nombre
                select new
                {
                    gi.id_rsvp_grupo_integrante,
                    inv.id_invitado,
                    nombre_completo = inv.nombre + " " + inv.apellido
                }
            ).ToListAsync();

            var idsIntegrantes = participantesBase.Select(x => x.id_rsvp_grupo_integrante).ToList();
            var idsInvitados = participantesBase.Select(x => x.id_invitado).ToList();

            var periodos = await _context.Set<ef_programa_inscripcion_periodos>()
                .AsNoTracking()
                .Where(x => x.id_inscripcion == insc.id_inscripcion && x.activo == true)
                .ToListAsync();

            var servicios = await _context.Set<ef_programa_inscripcion_servicios>()
                .AsNoTracking()
                .Where(x => x.id_inscripcion == insc.id_inscripcion && x.activo == true)
                .ToListAsync();

            var restricciones = await _context.Set<ef_rsvp_integrante_restricciones>()
                .AsNoTracking()
                .Where(x => idsIntegrantes.Contains(x.id_rsvp_grupo_integrante))
                .ToListAsync();

            var salud = await _context.Set<ef_programa_inscripcion_salud_fichas>()
                .AsNoTracking()
                .Where(x => idsIntegrantes.Contains(x.id_rsvp_grupo_integrante))
                .ToListAsync();

            var autorizaciones = await _context.Set<ef_autorizaciones>()
                .AsNoTracking()
                .Where(x =>
                    x.id_evento == insc.id_evento &&
                    x.activo == true &&
                    x.tipo == "R" &&
                    x.qr_token != null &&
                    idsInvitados.Contains(x.id_invitado_objetivo))
                .ToListAsync();

            var retiros = await (
                from r in _context.Set<ef_retiros>().AsNoTracking()
                join inv in _context.Set<ef_invitados>().AsNoTracking()
                    on r.id_invitado_nino equals inv.id_invitado
                where r.id_evento == insc.id_evento
                      && idsInvitados.Contains(r.id_invitado_nino)
                orderby r.fecha_retiro descending
                select new PortalRetiroDTO
                {
                    IdRetiro = r.id_retiro,
                    Participante = inv.nombre + " " + inv.apellido,
                    NombreRetirador = r.nombre_retirador,
                    FechaRetiro = r.fecha_retiro,
                    FechaOperativa = r.fecha_operativa
                }
            ).ToListAsync();

            var saludAcciones = await (
                from a in _context.Set<ef_programa_salud_acciones>().AsNoTracking()
                join inv in _context.Set<ef_invitados>().AsNoTracking()
                    on a.id_participante equals inv.id_invitado
                where a.id_evento == insc.id_evento
                      && a.activo == true
                      && idsInvitados.Contains(a.id_participante)
                orderby a.fecha_hora descending
                select new PortalSaludAccionDTO
                {
                    IdAccionSalud = a.id_accion_salud,
                    IdParticipante = a.id_participante,
                    Participante = inv.nombre + " " + inv.apellido,
                    FechaHora = a.fecha_hora,
                    TipoAccion = a.tipo_accion,
                    Descripcion = a.descripcion,
                    RequirioContactoFamilia = a.requirio_contacto_familia,
                    ContactoRealizado = a.contacto_realizado,
                    RequiereSeguimiento = a.requiere_seguimiento
                }
            ).ToListAsync();

            var fotos = await GetFotosPortalAsync(insc.id_evento);

            var ajustes = await _context.Set<ef_programa_inscripcion_ajustes>()
                .AsNoTracking()
                .Where(x => x.id_inscripcion == insc.id_inscripcion && x.activo == true)
                .ToListAsync();

            var pagos = await _context.Set<ef_programa_inscripcion_pagos>()
                .AsNoTracking()
                .Where(x => x.id_inscripcion == insc.id_inscripcion && x.anulado == false)
                .ToListAsync();

            var descuentos = ajustes
                .Where(x => x.tipo == "DESCUENTO" || x.tipo == "BONIFICACION")
                .Sum(x => x.importe);

            var recargos = ajustes
                .Where(x => x.tipo == "RECARGO")
                .Sum(x => x.importe);

            var totalAPagar = insc.total_general - descuentos + recargos;
            if (totalAPagar < 0) totalAPagar = 0;

            var totalPagado = pagos.Sum(x => x.importe);
            var saldo = totalAPagar - totalPagado;
            if (saldo < 0) saldo = 0;

            var participantesDto = participantesBase.Select(p => new PortalProgramaParticipanteDTO
            {
                IdInvitado = p.id_invitado,
                IdRsvpGrupoIntegrante = p.id_rsvp_grupo_integrante,
                NombreCompleto = p.nombre_completo,
                Periodos = periodos
                    .Where(x => x.id_rsvp_grupo_integrante == p.id_rsvp_grupo_integrante)
                    .Select(x => x.nombre)
                    .ToList(),
                Servicios = servicios
                    .Where(x => x.id_rsvp_grupo_integrante == p.id_rsvp_grupo_integrante)
                    .Select(x => x.nombre)
                    .Distinct()
                    .ToList(),
                TieneRestricciones = restricciones.Any(x => x.id_rsvp_grupo_integrante == p.id_rsvp_grupo_integrante),
                TieneSaludCargada = salud.Any(x => x.id_rsvp_grupo_integrante == p.id_rsvp_grupo_integrante)
            }).ToList();

            var qrsRetiro = autorizaciones
                .GroupBy(x => new
                {
                    x.nombre_autorizado,
                    x.telefono_autorizado,
                    x.relacion,
                    x.qr_token
                })
                .Select(g => new PortalQrRetiroDTO
                {
                    NombreAutorizado = g.Key.nombre_autorizado,
                    TelefonoAutorizado = g.Key.telefono_autorizado,
                    Relacion = g.Key.relacion,
                    QrToken = g.Key.qr_token!,
                    Participantes = g.Select(a =>
                    {
                        var p = participantesBase.FirstOrDefault(x => x.id_invitado == a.id_invitado_objetivo);
                        return p?.nombre_completo ?? "";
                    })
                    .Where(x => !string.IsNullOrWhiteSpace(x))
                    .ToList()
                })
                .ToList();

            return new PortalPublicoDTO
            {
                TipoPortal = "PROGRAMA",
                IdEvento = evento.id_evento,
                Evento = MapEvento(evento),
                Usuario = new PortalUsuarioDTO
                {
                    NombreVisible = (insc.responsable_nombre + " " + insc.responsable_apellido).Trim(),
                    Email = insc.responsable_email,
                    Telefono = insc.responsable_telefono
                },
                Secciones = secciones,
                ProgramaData = new PortalProgramaDataDTO
                {
                    IdInscripcion = insc.id_inscripcion,
                    IdRsvpGrupo = insc.id_rsvp_grupo,
                    Pago = new PortalPagoDTO
                    {
                        TotalOriginal = insc.total_general,
                        TotalPagado = totalPagado,
                        Saldo = saldo,
                        Moneda = insc.moneda,
                        EstadoPago = ResolverEstadoPago(totalAPagar, totalPagado)
                    },
                    Participantes = participantesDto,
                    QrsRetiro = qrsRetiro,
                    Retiros = retiros,
                    SaludAcciones = saludAcciones,
                    Fotos = fotos
                }
            };
        }

        private async Task<PortalPublicoDTO> ArmarPortalEventoPrivadoAsync(
            ef_invitados invitado,
            short idIdioma)
        {
            var evento = await _context.Set<ef_eventos>()
                .AsNoTracking()
                .SingleAsync(x => x.id_evento == invitado.id_evento);

            var secciones = await GetSeccionesPortalAsync(evento);
            var fotos = await GetFotosPortalAsync(evento.id_evento);

            var agenda = await _context.Set<ef_evento_tramos>()
                .AsNoTracking()
                .Where(x => x.id_evento == evento.id_evento && x.activo == true)
                .OrderBy(x => x.fecha_hora_inicio)
                .Select(x => new PortalAgendaItemDTO
                {
                    IdTramo = x.id_tramo,
                    Nombre = x.nombre,
                    FechaHoraInicio = x.fecha_hora_inicio,
                    FechaHoraFin = x.fecha_hora_fin,
                    Lugar = x.lugar
                })
                .ToListAsync();

            return new PortalPublicoDTO
            {
                TipoPortal = "EVENTO_PRIVADO",
                IdEvento = evento.id_evento,
                Evento = MapEvento(evento),
                Usuario = new PortalUsuarioDTO
                {
                    NombreVisible = (invitado.nombre + " " + invitado.apellido).Trim(),
                    Email = invitado.email,
                    Telefono = invitado.celular
                },
                Secciones = secciones,
                EventoPrivadoData = new PortalEventoPrivadoDataDTO
                {
                    IdInvitado = invitado.id_invitado,
                    RsvpEstado = invitado.rsvp_estado,
                    RsvpMensaje = invitado.rsvp_mensaje,
                    QrToken = invitado.qr_token,
                    Agenda = agenda,
                    Fotos = fotos
                }
            };
        }

        private async Task<PortalPublicoDTO> ArmarPortalEventoPublicoAsync(
            ef_evento_acceso_links link,
            short idIdioma)
        {
            var evento = await _context.Set<ef_eventos>()
                .AsNoTracking()
                .SingleAsync(x => x.id_evento == link.id_evento);

            var secciones = await GetSeccionesPortalAsync(evento);
            var fotos = await GetFotosPortalAsync(evento.id_evento);

            return new PortalPublicoDTO
            {
                TipoPortal = "EVENTO_PUBLICO",
                IdEvento = evento.id_evento,
                Evento = MapEvento(evento),
                Usuario = new PortalUsuarioDTO
                {
                    NombreVisible = link.titulo
                },
                Secciones = secciones,
                EventoPublicoData = new PortalEventoPublicoDataDTO
                {
                    IdAccesoLink = link.id_acceso_link,
                    TituloCampania = link.titulo,
                    LeyendaPublica = link.leyenda_publica,
                    BeneficioTitulo = link.beneficio_titulo,
                    BeneficioDescripcion = link.beneficio_descripcion,
                    BeneficioHasta = link.beneficio_hasta,
                    MensajePostRegistro = link.mensaje_post_registro,
                    Fotos = fotos
                }
            };
        }

        private async Task<List<PortalSeccionDTO>> GetSeccionesPortalAsync(ef_eventos evento)
        {
            var configuradas = await (
                from c in _context.Set<ef_evento_portal_config>().AsNoTracking()
                join s in _context.Set<ef_param_portal_secciones>().AsNoTracking()
                    on c.id_portal_seccion equals s.id_portal_seccion
                where c.id_evento == evento.id_evento
                      && c.activo == true
                      && s.activo == true
                orderby c.orden
                select new PortalSeccionDTO
                {
                    Codigo = s.codigo,
                    Titulo = c.titulo_override ?? s.descripcion ?? s.codigo,
                    Visible = c.visible,
                    Orden = c.orden,
                    ConfigJson = c.config_json
                }
            ).ToListAsync();

            if (configuradas.Any())
                return configuradas.Where(x => x.Visible).ToList();

            var esPrograma = evento.tipo_operacion == "PROGRAMA";

            return await _context.Set<ef_param_portal_secciones>()
                .AsNoTracking()
                .Where(x =>
                    x.activo == true &&
                    (esPrograma ? x.aplica_programa == true : x.aplica_evento == true))
                .OrderBy(x => x.orden_default)
                .Select(x => new PortalSeccionDTO
                {
                    Codigo = x.codigo,
                    Titulo = x.descripcion ?? x.codigo,
                    Visible = true,
                    Orden = x.orden_default,
                    ConfigJson = null
                })
                .ToListAsync();
        }

        private async Task<List<PortalFotoDTO>> GetFotosPortalAsync(long idEvento)
        {
            return await _context.Set<ef_evento_portal_fotos>()
                .AsNoTracking()
                .Where(x =>
                    x.id_evento == idEvento &&
                    x.activo == true &&
                    x.visible_portal == true)
                .OrderByDescending(x => x.fecha_foto)
                .ThenByDescending(x => x.fecha_alta)
                .Select(x => new PortalFotoDTO
                {
                    IdPortalFoto = x.id_portal_foto,
                    Titulo = x.titulo,
                    Descripcion = x.descripcion,
                    UrlFoto = x.url_foto,
                    FechaFoto = x.fecha_foto
                })
                .ToListAsync();
        }

        private static PortalEventoDTO MapEvento(ef_eventos evento)
        {
            return new PortalEventoDTO
            {
                Titulo = evento.saludo ?? evento.anfitriones_texto,
                MensajeBienvenida = evento.mensaje_bienvenida,
                AnfitrionesTexto = evento.anfitriones_texto,
                FechaEvento = evento.fecha_evento,
                FechaInicio = evento.fecha_inicio,
                FechaFin = evento.fecha_fin,
                TipoOperacion = evento.tipo_operacion
            };
        }

        private static string ResolverEstadoPago(decimal totalAPagar, decimal totalPagado)
        {
            if (totalAPagar <= 0)
                return "SIN_CARGO";

            if (totalPagado <= 0)
                return "PENDIENTE";

            if (totalPagado < totalAPagar)
                return "PARCIAL";

            return "PAGADO";
        }
    }
}
________________________________________
3. Nota importante
Este controller asume que estas entities tienen esos campos:
ef_evento_tramos:
id_tramo, id_evento, nombre, fecha_hora_inicio, fecha_hora_fin, lugar, activo

ef_evento_acceso_links:
id_evento, beneficio_titulo, beneficio_descripcion, beneficio_hasta, mensaje_post_registro
Si alguno en tu entity tiene otro nombre, mañana lo ajustamos puntual.
________________________________________
4. Endpoints de prueba
Programa
GET /portal/{token_consulta}?idIdioma=1
Boda / evento privado
GET /portal/{rsvp_token}?idIdioma=1
Tardeo / evento público
GET /portal/{token_acceso_link}?idIdioma=1



BLOQUE 3 — SQL completo + Entities + Configurations + DataContext
Este bloque deja armada la base del Portal del Participante. El concepto encaja con lo que ya tenés: las features del evento se resuelven desde backend para que el front solo muestre lo que corresponde, y la web pública/invitación debe mostrar u ocultar secciones según esas features activas. 
________________________________________
1. SQL — secciones del portal
create table if not exists public.ef_param_portal_secciones (
    id_portal_seccion smallint generated always as identity primary key,
    codigo varchar(60) not null,
    descripcion varchar(200) null,
    aplica_evento boolean not null default true,
    aplica_programa boolean not null default true,
    requiere_feature_codigo varchar(80) null,
    orden_default smallint not null default 1,
    activo boolean not null default true,
    fecha_alta timestamptz not null default now(),
    fecha_modif timestamptz null
);

create unique index if not exists ux_param_portal_secciones_codigo
on public.ef_param_portal_secciones(codigo);
________________________________________
2. SQL — configuración de secciones por evento/programa
create table if not exists public.ef_evento_portal_config (
    id_evento_portal_config bigint generated always as identity primary key,
    id_evento bigint not null,
    id_portal_seccion smallint not null,
    visible boolean not null default true,
    orden smallint not null default 1,
    titulo_override varchar(120) null,
    config_json jsonb null,
    activo boolean not null default true,
    fecha_alta timestamptz not null default now(),
    fecha_modif timestamptz null,

    constraint fk_evento_portal_config_evento
        foreign key (id_evento)
        references public.ef_eventos(id_evento)
        on delete cascade,

    constraint fk_evento_portal_config_seccion
        foreign key (id_portal_seccion)
        references public.ef_param_portal_secciones(id_portal_seccion)
        on delete restrict
);

create unique index if not exists ux_evento_portal_config_evento_seccion
on public.ef_evento_portal_config(id_evento, id_portal_seccion);

create index if not exists ix_evento_portal_config_evento
on public.ef_evento_portal_config(id_evento, activo);
________________________________________
3. SQL — fotos internas del portal
Sí: conviene tabla nueva.
Estas fotos no son el álbum colaborativo de una boda con QR. Son fotos publicadas por staff/organizador para el portal familiar o portal del participante.
create table if not exists public.ef_evento_portal_fotos (
    id_portal_foto bigint generated always as identity primary key,
    id_evento bigint not null,
    titulo varchar(120) null,
    descripcion varchar(300) null,
    url_foto varchar(600) not null,
    fecha_foto date null,
    visible_portal boolean not null default true,
    activo boolean not null default true,
    id_usuario_carga bigint null,
    fecha_alta timestamptz not null default now(),
    fecha_modif timestamptz null,

    constraint fk_evento_portal_fotos_evento
        foreign key (id_evento)
        references public.ef_eventos(id_evento)
        on delete cascade,

    constraint fk_evento_portal_fotos_usuario
        foreign key (id_usuario_carga)
        references public.ef_usuarios(id_usuario)
        on delete set null
);

create index if not exists ix_evento_portal_fotos_evento
on public.ef_evento_portal_fotos(id_evento, visible_portal, activo, fecha_foto);
________________________________________
4. SQL — inserts base de secciones
insert into public.ef_param_portal_secciones
(codigo, descripcion, aplica_evento, aplica_programa, requiere_feature_codigo, orden_default)
values
('RESUMEN', 'Resumen', true, true, null, 1),
('AGENDA', 'Agenda', true, false, null, 2),
('PARTICIPANTES', 'Participantes', true, true, null, 3),
('PAGOS', 'Pagos', false, true, null, 4),
('QRS_RETIRO', 'QR de retiro', false, true, null, 5),
('RETIROS', 'Retiros', false, true, null, 6),
('SALUD', 'Salud', false, true, null, 7),
('SALUD_ACCIONES', 'Acciones de salud', false, true, null, 8),
('AUTORIZACIONES', 'Autorizaciones', false, true, null, 9),
('NOVEDADES', 'Novedades', true, true, 'NOVEDADES_EVENTO', 10),
('FOTOS', 'Fotos', true, true, null, 11),
('ALBUM', 'Álbum', true, false, 'ALBUM_COLABORATIVO_QR', 12),
('MUSICA', 'Música', true, false, 'MUSICA_SUGERENCIAS', 13),
('HOSPEDAJES', 'Hospedajes', true, false, 'HOSPEDAJES', 14),
('REGALOS', 'Regalos', true, false, 'REGALOS', 15),
('ACCESO_BENEFICIO', 'Acceso / beneficio', true, false, null, 16),
('QR_INGRESO', 'QR de ingreso', true, false, 'QR_CHECKIN', 17)
on conflict (codigo) do nothing;
________________________________________
5. Entity ef_param_portal_secciones
Archivo:
DataSchema/ef_param_portal_secciones.cs
using API.DataSchema.Interfaz;
using System;

namespace API.DataSchema
{
    public class ef_param_portal_secciones : IRegistroUnico
    {
        public short id_portal_seccion { get; set; }

        public string codigo { get; set; } = null!;

        public string? descripcion { get; set; }

        public bool aplica_evento { get; set; }

        public bool aplica_programa { get; set; }

        public string? requiere_feature_codigo { get; set; }

        public short orden_default { get; set; }

        public bool activo { get; set; }

        public DateTimeOffset fecha_alta { get; set; }

        public DateTimeOffset? fecha_modif { get; set; }

        public string[] UniqueProperties => new[] { "codigo" };
    }
}
________________________________________
6. Entity ef_evento_portal_config
Archivo:
DataSchema/ef_evento_portal_config.cs
using API.DataSchema.Interfaz;
using System;

namespace API.DataSchema
{
    public class ef_evento_portal_config : IRegistroUnico
    {
        public long id_evento_portal_config { get; set; }

        public long id_evento { get; set; }

        public short id_portal_seccion { get; set; }

        public bool visible { get; set; }

        public short orden { get; set; }

        public string? titulo_override { get; set; }

        public string? config_json { get; set; }

        public bool activo { get; set; }

        public DateTimeOffset fecha_alta { get; set; }

        public DateTimeOffset? fecha_modif { get; set; }

        public string[] UniqueProperties => Array.Empty<string>();

        public virtual ef_eventos? evento { get; set; }

        public virtual ef_param_portal_secciones? portal_seccion { get; set; }
    }
}
________________________________________
7. Entity ef_evento_portal_fotos
Archivo:
DataSchema/ef_evento_portal_fotos.cs
using API.DataSchema.Interfaz;
using System;

namespace API.DataSchema
{
    public class ef_evento_portal_fotos : IRegistroUnico
    {
        public long id_portal_foto { get; set; }

        public long id_evento { get; set; }

        public string? titulo { get; set; }

        public string? descripcion { get; set; }

        public string url_foto { get; set; } = null!;

        public DateOnly? fecha_foto { get; set; }

        public bool visible_portal { get; set; }

        public bool activo { get; set; }

        public long? id_usuario_carga { get; set; }

        public DateTimeOffset fecha_alta { get; set; }

        public DateTimeOffset? fecha_modif { get; set; }

        public string[] UniqueProperties => Array.Empty<string>();

        public virtual ef_eventos? evento { get; set; }

        public virtual ef_usuarios? usuario_carga { get; set; }
    }
}
________________________________________
8. Configuration ef_param_portal_seccionesConfiguration
Archivo:
DataSchema/ModelConfiguration/ef_param_portal_seccionesConfiguration.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_param_portal_seccionesConfiguration : IEntityTypeConfiguration<ef_param_portal_secciones>
    {
        public void Configure(EntityTypeBuilder<ef_param_portal_secciones> builder)
        {
            builder.ToTable("ef_param_portal_secciones", "public");

            builder.HasKey(x => x.id_portal_seccion);

            builder.Property(x => x.id_portal_seccion)
                .ValueGeneratedOnAdd();

            builder.Property(x => x.codigo)
                .HasMaxLength(60)
                .IsRequired();

            builder.Property(x => x.descripcion)
                .HasMaxLength(200);

            builder.Property(x => x.aplica_evento)
                .IsRequired()
                .HasDefaultValue(true);

            builder.Property(x => x.aplica_programa)
                .IsRequired()
                .HasDefaultValue(true);

            builder.Property(x => x.requiere_feature_codigo)
                .HasMaxLength(80);

            builder.Property(x => x.orden_default)
                .IsRequired()
                .HasDefaultValue((short)1);

            builder.Property(x => x.activo)
                .IsRequired()
                .HasDefaultValue(true);

            builder.Property(x => x.fecha_alta)
                .IsRequired()
                .HasDefaultValueSql("now()");

            builder.Property(x => x.fecha_modif);

            builder.HasIndex(x => x.codigo)
                .IsUnique()
                .HasDatabaseName("ux_param_portal_secciones_codigo");
        }
    }
}
________________________________________
9. Configuration ef_evento_portal_configConfiguration
Archivo:
DataSchema/ModelConfiguration/ef_evento_portal_configConfiguration.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_evento_portal_configConfiguration : IEntityTypeConfiguration<ef_evento_portal_config>
    {
        public void Configure(EntityTypeBuilder<ef_evento_portal_config> builder)
        {
            builder.ToTable("ef_evento_portal_config", "public");

            builder.HasKey(x => x.id_evento_portal_config);

            builder.Property(x => x.id_evento_portal_config)
                .ValueGeneratedOnAdd();

            builder.Property(x => x.id_evento)
                .IsRequired();

            builder.Property(x => x.id_portal_seccion)
                .IsRequired();

            builder.Property(x => x.visible)
                .IsRequired()
                .HasDefaultValue(true);

            builder.Property(x => x.orden)
                .IsRequired()
                .HasDefaultValue((short)1);

            builder.Property(x => x.titulo_override)
                .HasMaxLength(120);

            builder.Property(x => x.config_json)
                .HasColumnType("jsonb");

            builder.Property(x => x.activo)
                .IsRequired()
                .HasDefaultValue(true);

            builder.Property(x => x.fecha_alta)
                .IsRequired()
                .HasDefaultValueSql("now()");

            builder.Property(x => x.fecha_modif);

            builder.HasIndex(x => new { x.id_evento, x.id_portal_seccion })
                .IsUnique()
                .HasDatabaseName("ux_evento_portal_config_evento_seccion");

            builder.HasIndex(x => new { x.id_evento, x.activo })
                .HasDatabaseName("ix_evento_portal_config_evento");

            builder.HasOne(x => x.evento)
                .WithMany()
                .HasForeignKey(x => x.id_evento)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.portal_seccion)
                .WithMany()
                .HasForeignKey(x => x.id_portal_seccion)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
________________________________________
10. Configuration ef_evento_portal_fotosConfiguration
Archivo:
DataSchema/ModelConfiguration/ef_evento_portal_fotosConfiguration.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.DataSchema.ModelConfiguration
{
    public class ef_evento_portal_fotosConfiguration : IEntityTypeConfiguration<ef_evento_portal_fotos>
    {
        public void Configure(EntityTypeBuilder<ef_evento_portal_fotos> builder)
        {
            builder.ToTable("ef_evento_portal_fotos", "public");

            builder.HasKey(x => x.id_portal_foto);

            builder.Property(x => x.id_portal_foto)
                .ValueGeneratedOnAdd();

            builder.Property(x => x.id_evento)
                .IsRequired();

            builder.Property(x => x.titulo)
                .HasMaxLength(120);

            builder.Property(x => x.descripcion)
                .HasMaxLength(300);

            builder.Property(x => x.url_foto)
                .HasMaxLength(600)
                .IsRequired();

            builder.Property(x => x.fecha_foto);

            builder.Property(x => x.visible_portal)
                .IsRequired()
                .HasDefaultValue(true);

            builder.Property(x => x.activo)
                .IsRequired()
                .HasDefaultValue(true);

            builder.Property(x => x.id_usuario_carga);

            builder.Property(x => x.fecha_alta)
                .IsRequired()
                .HasDefaultValueSql("now()");

            builder.Property(x => x.fecha_modif);

            builder.HasIndex(x => new
            {
                x.id_evento,
                x.visible_portal,
                x.activo,
                x.fecha_foto
            })
            .HasDatabaseName("ix_evento_portal_fotos_evento");

            builder.HasOne(x => x.evento)
                .WithMany()
                .HasForeignKey(x => x.id_evento)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.usuario_carga)
                .WithMany()
                .HasForeignKey(x => x.id_usuario_carga)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
________________________________________
11. DataContext
En DataContext.cs, agregá:
public DbSet<ef_param_portal_secciones> ef_param_portal_secciones { get; set; }
public DbSet<ef_evento_portal_config> ef_evento_portal_config { get; set; }
public DbSet<ef_evento_portal_fotos> ef_evento_portal_fotos { get; set; }
Y si aplicás configuraciones manuales:
modelBuilder.ApplyConfiguration(new ef_param_portal_seccionesConfiguration());
modelBuilder.ApplyConfiguration(new ef_evento_portal_configConfiguration());
modelBuilder.ApplyConfiguration(new ef_evento_portal_fotosConfiguration());
________________________________________
12. Ajuste en confirmación de inscripción
En el Confirmar de inscripción, asegurate de que token_consulta siempre exista.
Buscá donde creás ef_programa_inscripciones y agregá:
token_consulta = GenerarToken(32),
O, si la inscripción ya se creó antes:
if (string.IsNullOrWhiteSpace(inscripcion.token_consulta))
{
    inscripcion.token_consulta = GenerarToken(32);
}
El padre entra con:
GET /portal/{token_consulta}
No necesita login.



BLOQUE 4 — Controllers admin: configurar secciones + fotos internas
Este bloque agrega:
1. Configurar qué secciones se ven en el portal
2. Subir/administrar fotos internas del portal
Endpoints nuevos:
GET  /eventos/{idEvento}/portal/config
PUT  /eventos/{idEvento}/portal/config

GET  /eventos/{idEvento}/portal/fotos
POST /eventos/{idEvento}/portal/fotos/upsert
PUT  /eventos/portal/fotos/{idPortalFoto}/set-activo?activo=false
PUT  /eventos/portal/fotos/{idPortalFoto}/set-visible?visible=false
________________________________________
1. DTOs — Configuración de portal
Archivo:
DataSchema/DTO/Portal/PortalConfigDTO.cs
using System.Collections.Generic;

namespace API.DataSchema.DTO.Portal
{
    public class PortalConfigItemDTO
    {
        public short IdPortalSeccion { get; set; }
        public string Codigo { get; set; } = "";
        public string Descripcion { get; set; } = "";
        public bool Visible { get; set; }
        public short Orden { get; set; }
        public string? TituloOverride { get; set; }
        public string? ConfigJson { get; set; }

        public bool AplicaEvento { get; set; }
        public bool AplicaPrograma { get; set; }
        public string? RequiereFeatureCodigo { get; set; }
    }

    public class PortalConfigGuardarRequest
    {
        public List<PortalConfigGuardarItemRequest> Items { get; set; } = new();
    }

    public class PortalConfigGuardarItemRequest
    {
        public short IdPortalSeccion { get; set; }
        public bool Visible { get; set; }
        public short Orden { get; set; }
        public string? TituloOverride { get; set; }
        public string? ConfigJson { get; set; }
    }
}
________________________________________
2. Controller — configuración del portal
Archivo:
Controllers/Portal/portalConfigController.cs
using API.DataSchema;
using API.DataSchema.DTO.Portal;
using API.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers.Portal
{
    [ApiController]
    [Route("eventos")]
    [Authorize]
    public class portalConfigController : ControllerBase
    {
        private readonly DataContext _context;

        public portalConfigController(DataContext context)
        {
            _context = context;
        }

        [HttpGet("{idEvento:long}/portal/config")]
        public async Task<ActionResult<List<PortalConfigItemDTO>>> GetConfig(long idEvento)
        {
            var idUsuario = User.GetUserId();

            var puede = await UsuarioPuedeAdministrarEvento(idEvento, idUsuario);

            if (!puede)
                return Forbid();

            var evento = await _context.Set<ef_eventos>()
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.id_evento == idEvento);

            if (evento == null)
                return NotFound("Evento inexistente.");

            var esPrograma = evento.tipo_operacion == "PROGRAMA";

            var secciones = await _context.Set<ef_param_portal_secciones>()
                .AsNoTracking()
                .Where(x =>
                    x.activo == true &&
                    (esPrograma ? x.aplica_programa == true : x.aplica_evento == true))
                .OrderBy(x => x.orden_default)
                .ToListAsync();

            var config = await _context.Set<ef_evento_portal_config>()
                .AsNoTracking()
                .Where(x => x.id_evento == idEvento && x.activo == true)
                .ToListAsync();

            var result = secciones.Select(s =>
            {
                var c = config.FirstOrDefault(x => x.id_portal_seccion == s.id_portal_seccion);

                return new PortalConfigItemDTO
                {
                    IdPortalSeccion = s.id_portal_seccion,
                    Codigo = s.codigo,
                    Descripcion = s.descripcion ?? s.codigo,
                    Visible = c?.visible ?? true,
                    Orden = c?.orden ?? s.orden_default,
                    TituloOverride = c?.titulo_override,
                    ConfigJson = c?.config_json,
                    AplicaEvento = s.aplica_evento,
                    AplicaPrograma = s.aplica_programa,
                    RequiereFeatureCodigo = s.requiere_feature_codigo
                };
            })
            .OrderBy(x => x.Orden)
            .ToList();

            return Ok(result);
        }

        [HttpPut("{idEvento:long}/portal/config")]
        public async Task<IActionResult> GuardarConfig(
            long idEvento,
            [FromBody] PortalConfigGuardarRequest req)
        {
            var idUsuario = User.GetUserId();

            var puede = await UsuarioPuedeAdministrarEvento(idEvento, idUsuario);

            if (!puede)
                return Forbid();

            var evento = await _context.Set<ef_eventos>()
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.id_evento == idEvento);

            if (evento == null)
                return NotFound("Evento inexistente.");

            if (req.Items == null || !req.Items.Any())
                return BadRequest("Debe informar secciones.");

            var idsSecciones = req.Items
                .Select(x => x.IdPortalSeccion)
                .Distinct()
                .ToList();

            var seccionesValidas = await _context.Set<ef_param_portal_secciones>()
                .AsNoTracking()
                .Where(x => idsSecciones.Contains(x.id_portal_seccion) && x.activo == true)
                .ToListAsync();

            if (seccionesValidas.Count != idsSecciones.Count)
                return BadRequest("Hay secciones inválidas o inactivas.");

            var actuales = await _context.Set<ef_evento_portal_config>()
                .Where(x => x.id_evento == idEvento)
                .ToListAsync();

            foreach (var item in req.Items)
            {
                var seccion = seccionesValidas
                    .First(x => x.id_portal_seccion == item.IdPortalSeccion);

                var actual = actuales
                    .FirstOrDefault(x => x.id_portal_seccion == item.IdPortalSeccion);

                if (actual == null)
                {
                    actual = new ef_evento_portal_config
                    {
                        id_evento = idEvento,
                        id_portal_seccion = item.IdPortalSeccion,
                        fecha_alta = DateTimeOffset.UtcNow
                    };

                    _context.Set<ef_evento_portal_config>().Add(actual);
                }

                actual.visible = item.Visible;
                actual.orden = item.Orden <= 0 ? seccion.orden_default : item.Orden;
                actual.titulo_override = string.IsNullOrWhiteSpace(item.TituloOverride)
                    ? null
                    : item.TituloOverride.Trim();
                actual.config_json = string.IsNullOrWhiteSpace(item.ConfigJson)
                    ? null
                    : item.ConfigJson.Trim();
                actual.activo = true;
                actual.fecha_modif = DateTimeOffset.UtcNow;
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                ok = true,
                id_evento = idEvento
            });
        }

        private async Task<bool> UsuarioPuedeAdministrarEvento(long idEvento, long idUsuario)
        {
            return await (
                from eu in _context.Set<ef_evento_usuarios>().AsNoTracking()
                join r in _context.Set<ef_roles>().AsNoTracking()
                    on eu.id_rol equals r.id_rol
                where eu.id_evento == idEvento
                      && eu.id_usuario == idUsuario
                      && eu.activo == true
                      && (
                          r.codigo == "EVENT_OWNER" ||
                          r.codigo == "EVENT_HOST" ||
                          r.codigo == "EVENT_CLIENT_ADMIN"
                      )
                select eu.id_evento_usuario
            ).AnyAsync();
        }
    }
}
Si tu entity ef_evento_usuarios no tiene id_evento_usuario, cambiá el select por select eu.id_evento.
________________________________________
3. DTOs — Fotos internas del portal
Archivo:
DataSchema/DTO/Portal/PortalFotosDTO.cs
using System;

namespace API.DataSchema.DTO.Portal
{
    public class PortalFotoAdminDTO
    {
        public long IdPortalFoto { get; set; }
        public long IdEvento { get; set; }
        public string? Titulo { get; set; }
        public string? Descripcion { get; set; }
        public string UrlFoto { get; set; } = "";
        public DateOnly? FechaFoto { get; set; }
        public bool VisiblePortal { get; set; }
        public bool Activo { get; set; }
        public DateTimeOffset FechaAlta { get; set; }
    }

    public class PortalFotoUpsertRequest
    {
        public long? IdPortalFoto { get; set; }
        public string? Titulo { get; set; }
        public string? Descripcion { get; set; }
        public string UrlFoto { get; set; } = "";
        public DateOnly? FechaFoto { get; set; }
        public bool VisiblePortal { get; set; } = true;
        public bool Activo { get; set; } = true;
    }
}
________________________________________
4. Controller — fotos internas del portal
Archivo:
Controllers/Portal/portalFotosController.cs
using API.DataSchema;
using API.DataSchema.DTO.Portal;
using API.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers.Portal
{
    [ApiController]
    [Route("eventos")]
    [Authorize]
    public class portalFotosController : ControllerBase
    {
        private readonly DataContext _context;

        public portalFotosController(DataContext context)
        {
            _context = context;
        }

        [HttpGet("{idEvento:long}/portal/fotos")]
        public async Task<ActionResult<List<PortalFotoAdminDTO>>> GetFotos(long idEvento)
        {
            var idUsuario = User.GetUserId();

            var puede = await UsuarioPuedeAdministrarEvento(idEvento, idUsuario);

            if (!puede)
                return Forbid();

            var fotos = await _context.Set<ef_evento_portal_fotos>()
                .AsNoTracking()
                .Where(x => x.id_evento == idEvento)
                .OrderByDescending(x => x.fecha_alta)
                .Select(x => new PortalFotoAdminDTO
                {
                    IdPortalFoto = x.id_portal_foto,
                    IdEvento = x.id_evento,
                    Titulo = x.titulo,
                    Descripcion = x.descripcion,
                    UrlFoto = x.url_foto,
                    FechaFoto = x.fecha_foto,
                    VisiblePortal = x.visible_portal,
                    Activo = x.activo,
                    FechaAlta = x.fecha_alta
                })
                .ToListAsync();

            return Ok(fotos);
        }

        [HttpPost("{idEvento:long}/portal/fotos/upsert")]
        public async Task<IActionResult> UpsertFoto(
            long idEvento,
            [FromBody] PortalFotoUpsertRequest req)
        {
            var idUsuario = User.GetUserId();

            var puede = await UsuarioPuedeAdministrarEvento(idEvento, idUsuario);

            if (!puede)
                return Forbid();

            if (string.IsNullOrWhiteSpace(req.UrlFoto))
                return BadRequest("Debe informar la URL de la foto.");

            ef_evento_portal_fotos foto;

            if (req.IdPortalFoto.HasValue)
            {
                foto = await _context.Set<ef_evento_portal_fotos>()
                    .SingleOrDefaultAsync(x =>
                        x.id_portal_foto == req.IdPortalFoto.Value &&
                        x.id_evento == idEvento);

                if (foto == null)
                    return NotFound("Foto inexistente.");
            }
            else
            {
                foto = new ef_evento_portal_fotos
                {
                    id_evento = idEvento,
                    id_usuario_carga = idUsuario,
                    fecha_alta = DateTimeOffset.UtcNow
                };

                _context.Set<ef_evento_portal_fotos>().Add(foto);
            }

            foto.titulo = string.IsNullOrWhiteSpace(req.Titulo) ? null : req.Titulo.Trim();
            foto.descripcion = string.IsNullOrWhiteSpace(req.Descripcion) ? null : req.Descripcion.Trim();
            foto.url_foto = req.UrlFoto.Trim();
            foto.fecha_foto = req.FechaFoto;
            foto.visible_portal = req.VisiblePortal;
            foto.activo = req.Activo;
            foto.fecha_modif = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                ok = true,
                id_portal_foto = foto.id_portal_foto
            });
        }

        [HttpPut("portal/fotos/{idPortalFoto:long}/set-activo")]
        public async Task<IActionResult> SetActivo(long idPortalFoto, [FromQuery] bool activo)
        {
            var idUsuario = User.GetUserId();

            var foto = await _context.Set<ef_evento_portal_fotos>()
                .SingleOrDefaultAsync(x => x.id_portal_foto == idPortalFoto);

            if (foto == null)
                return NotFound("Foto inexistente.");

            var puede = await UsuarioPuedeAdministrarEvento(foto.id_evento, idUsuario);

            if (!puede)
                return Forbid();

            foto.activo = activo;
            foto.fecha_modif = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                ok = true,
                id_portal_foto = idPortalFoto,
                activo
            });
        }

        [HttpPut("portal/fotos/{idPortalFoto:long}/set-visible")]
        public async Task<IActionResult> SetVisible(long idPortalFoto, [FromQuery] bool visible)
        {
            var idUsuario = User.GetUserId();

            var foto = await _context.Set<ef_evento_portal_fotos>()
                .SingleOrDefaultAsync(x => x.id_portal_foto == idPortalFoto);

            if (foto == null)
                return NotFound("Foto inexistente.");

            var puede = await UsuarioPuedeAdministrarEvento(foto.id_evento, idUsuario);

            if (!puede)
                return Forbid();

            foto.visible_portal = visible;
            foto.fecha_modif = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                ok = true,
                id_portal_foto = idPortalFoto,
                visible_portal = visible
            });
        }

        private async Task<bool> UsuarioPuedeAdministrarEvento(long idEvento, long idUsuario)
        {
            return await (
                from eu in _context.Set<ef_evento_usuarios>().AsNoTracking()
                join r in _context.Set<ef_roles>().AsNoTracking()
                    on eu.id_rol equals r.id_rol
                where eu.id_evento == idEvento
                      && eu.id_usuario == idUsuario
                      && eu.activo == true
                      && (
                          r.codigo == "EVENT_OWNER" ||
                          r.codigo == "EVENT_HOST" ||
                          r.codigo == "EVENT_CLIENT_ADMIN"
                      )
                select eu.id_evento_usuario
            ).AnyAsync();
        }
    }
}
________________________________________
5. JSON — guardar configuración de portal
Endpoint:
PUT /eventos/34/portal/config
Ejemplo para programa/casal:
{
  "items": [
    {
      "idPortalSeccion": 1,
      "visible": true,
      "orden": 1,
      "tituloOverride": "Resumen",
      "configJson": null
    },
    {
      "idPortalSeccion": 3,
      "visible": true,
      "orden": 2,
      "tituloOverride": "Mis hijos",
      "configJson": null
    },
    {
      "idPortalSeccion": 4,
      "visible": true,
      "orden": 3,
      "tituloOverride": "Pagos",
      "configJson": null
    },
    {
      "idPortalSeccion": 5,
      "visible": true,
      "orden": 4,
      "tituloOverride": "QR de retiro",
      "configJson": null
    },
    {
      "idPortalSeccion": 6,
      "visible": true,
      "orden": 5,
      "tituloOverride": "Retiros",
      "configJson": null
    },
    {
      "idPortalSeccion": 8,
      "visible": true,
      "orden": 6,
      "tituloOverride": "Salud / avisos",
      "configJson": null
    },
    {
      "idPortalSeccion": 11,
      "visible": true,
      "orden": 7,
      "tituloOverride": "Fotos",
      "configJson": null
    }
  ]
}
Ejemplo boda:
{
  "items": [
    {
      "idPortalSeccion": 1,
      "visible": true,
      "orden": 1,
      "tituloOverride": "Resumen",
      "configJson": null
    },
    {
      "idPortalSeccion": 2,
      "visible": true,
      "orden": 2,
      "tituloOverride": "Agenda",
      "configJson": null
    },
    {
      "idPortalSeccion": 13,
      "visible": true,
      "orden": 3,
      "tituloOverride": "Música",
      "configJson": null
    },
    {
      "idPortalSeccion": 12,
      "visible": true,
      "orden": 4,
      "tituloOverride": "Álbum",
      "configJson": null
    },
    {
      "idPortalSeccion": 14,
      "visible": true,
      "orden": 5,
      "tituloOverride": "Hospedajes",
      "configJson": null
    },
    {
      "idPortalSeccion": 15,
      "visible": true,
      "orden": 6,
      "tituloOverride": "Regalos",
      "configJson": null
    }
  ]
}
Ejemplo tardeo:
{
  "items": [
    {
      "idPortalSeccion": 1,
      "visible": true,
      "orden": 1,
      "tituloOverride": "Resumen",
      "configJson": null
    },
    {
      "idPortalSeccion": 16,
      "visible": true,
      "orden": 2,
      "tituloOverride": "Tu beneficio",
      "configJson": null
    },
    {
      "idPortalSeccion": 17,
      "visible": true,
      "orden": 3,
      "tituloOverride": "QR de ingreso",
      "configJson": null
    },
    {
      "idPortalSeccion": 11,
      "visible": true,
      "orden": 4,
      "tituloOverride": "Fotos",
      "configJson": null
    }
  ]
}
________________________________________
6. JSON — cargar foto interna
Endpoint:
POST /eventos/34/portal/fotos/upsert
{
  "idPortalFoto": null,
  "titulo": "Actividad de piscina",
  "descripcion": "Grupo de la mañana",
  "urlFoto": "https://storage.eventia.app/aquamar/piscina-2026-06-24.jpg",
  "fechaFoto": "2026-06-24",
  "visiblePortal": true,
  "activo": true
}
________________________________________
7. Qué hace el front admin
Pantalla:
Evento / Programa
└── Portal
    ├── Secciones
    └── Fotos
Tab Secciones
Grilla:
Orden | Código | Título | Visible | Requiere feature | Acciones
Acciones:
editar título
cambiar orden
prender/apagar visible
guardar todo
Tab Fotos
Grilla:
Foto | Título | Fecha | Visible portal | Activo | Acciones
Acciones:
Nueva foto
Editar
Ocultar del portal
Desactivar


BLOQUE 5 — Pantallas públicas + JSON completos + URL portal en inscripción
Este bloque cierra la parte funcional para front:
1. Cómo entra el padre/invitado/persona registrada
2. Qué pantallas renderiza el portal
3. JSON completo de programa
4. JSON completo de boda
5. JSON completo de tardeo
6. Cambio en confirmar inscripción para devolver url_portal
________________________________________
1. Cómo se accede al portal
A. Programa / casal / clínica
El padre entra por:
GET /portal/{token_consulta}
Ese token_consulta sale de:
ef_programa_inscripciones.token_consulta
El link se debe mostrar al finalizar la inscripción:
Tu inscripción fue confirmada.
Guardá este enlace para consultar pagos, QR de retiro, avisos y fotos.
[Ir a mi portal familiar]
Ejemplo front:
https://eventia.app/portal/7f47e98b7f4d4d08b34f0d9e1d1a2abc
________________________________________
B. Evento privado tipo boda
El invitado entra por:
GET /portal/{rsvp_token}
Ese token ya vive en:
ef_invitados.rsvp_token
Sirve para:
ver su invitación
ver agenda
ver QR ingreso
ver música/álbum/regalos/hospedajes si están activos
________________________________________
C. Evento público tipo tardeo
La persona entra por:
GET /portal/{token}
Ese token puede ser:
ef_evento_acceso_links.token
Para campaña pública todavía representa el link/campaña.
Después de registrarse, si querés un portal individual real, lo ideal a futuro es devolver el rsvp_token del invitado generado o un token específico del registro.
Para ahora:
/portal/{token_campania}
muestra portal público/campaña.
________________________________________
2. Cambio en confirmar inscripción
Archivo
DataSchema/DTO/Programas/ProgramaInscripcionConfirmarResponse.cs
Agregá:
using System.Text.Json.Serialization;
using Newtonsoft.Json;

namespace API.DataSchema.DTO.Programas
{
    public class ProgramaInscripcionConfirmarResponse
    {
        [JsonPropertyName("ok")]
        [JsonProperty("ok")]
        public bool Ok { get; set; }

        [JsonPropertyName("id_inscripcion")]
        [JsonProperty("id_inscripcion")]
        public long IdInscripcion { get; set; }

        [JsonPropertyName("id_rsvp_grupo")]
        [JsonProperty("id_rsvp_grupo")]
        public long IdRsvpGrupo { get; set; }

        [JsonPropertyName("token_consulta")]
        [JsonProperty("token_consulta")]
        public string TokenConsulta { get; set; } = null!;

        [JsonPropertyName("url_portal")]
        [JsonProperty("url_portal")]
        public string UrlPortal { get; set; } = null!;

        [JsonPropertyName("total_general")]
        [JsonProperty("total_general")]
        public decimal TotalGeneral { get; set; }

        [JsonPropertyName("mensaje")]
        [JsonProperty("mensaje")]
        public string Mensaje { get; set; } = "Inscripción confirmada correctamente.";

        [JsonPropertyName("qrs_retiro")]
        [JsonProperty("qrs_retiro")]
        public List<ProgramaInscripcionQrRetiroDTO> QrsRetiro { get; set; } = new();
    }

    public class ProgramaInscripcionQrRetiroDTO
    {
        [JsonPropertyName("nombre_autorizado")]
        [JsonProperty("nombre_autorizado")]
        public string NombreAutorizado { get; set; } = "";

        [JsonPropertyName("telefono_autorizado")]
        [JsonProperty("telefono_autorizado")]
        public string? TelefonoAutorizado { get; set; }

        [JsonPropertyName("relacion")]
        [JsonProperty("relacion")]
        public string? Relacion { get; set; }

        [JsonPropertyName("qr_token")]
        [JsonProperty("qr_token")]
        public string QrToken { get; set; } = "";

        [JsonPropertyName("participantes")]
        [JsonProperty("participantes")]
        public List<ProgramaInscripcionQrParticipanteDTO> Participantes { get; set; } = new();
    }

    public class ProgramaInscripcionQrParticipanteDTO
    {
        [JsonPropertyName("id_invitado")]
        [JsonProperty("id_invitado")]
        public long IdInvitado { get; set; }

        [JsonPropertyName("nombre_completo")]
        [JsonProperty("nombre_completo")]
        public string NombreCompleto { get; set; } = "";
    }
}
Si ya tenías QrsRetiro, no dupliques las clases. Solo agregá UrlPortal.
________________________________________
3. Generar URL portal en el controller de confirmar
En programasInscripcionController, agregá IConfiguration si no lo tenés.
private readonly IConfiguration _config;
Constructor:
public programasInscripcionController(DataContext context, IConfiguration config)
{
    _context = context;
    _config = config;
}
O adaptalo si ya tenés más servicios inyectados.
En el return Ok(new ProgramaInscripcionConfirmarResponse { ... }), agregá:
var publicBaseUrl = _config["App:PublicBaseUrl"];

if (string.IsNullOrWhiteSpace(publicBaseUrl))
    publicBaseUrl = "https://eventia.app";

var urlPortal = publicBaseUrl.TrimEnd('/') + "/portal/" + inscripcion.token_consulta;
Y en el response:
UrlPortal = urlPortal,
Ejemplo completo del bloque final:
return Ok(new ProgramaInscripcionConfirmarResponse
{
    Ok = true,
    IdInscripcion = inscripcion.id_inscripcion,
    IdRsvpGrupo = grupo.id_rsvp_grupo,
    TokenConsulta = inscripcion.token_consulta,
    UrlPortal = urlPortal,
    TotalGeneral = inscripcion.total_general,
    Mensaje = "Inscripción confirmada correctamente.",
    QrsRetiro = qrsRetiro
});
En appsettings.json:
{
  "App": {
    "PublicBaseUrl": "https://eventia.app"
  }
}
En Render, variable:
App__PublicBaseUrl=https://eventia.app
________________________________________
4. Pantalla pública — Portal Programa
URL front
/portal/:token
Endpoint backend
GET /portal/{token}?idIdioma=1
Layout
┌───────────────────────────────────────────────┐
│ Casal Aquamar 2026                            │
│ Bienvenidos al casal de verano                │
└───────────────────────────────────────────────┘

Responsable
Mireia Pons
mireia@test.com
+34600777111

Cards:
[Estado inscripción: Confirmada]
[Pago: Parcial]
[Saldo: 243 EUR]

Tabs / secciones:
Resumen
Participantes
Pagos
QR retiro
Retiros
Salud / avisos
Fotos
________________________________________
5. Sección RESUMEN — programa
Muestra:
Nombre programa
Fechas
Responsable
Participantes
Estado de pago
Saldo
Campos:
evento.titulo
evento.fechaInicio
evento.fechaFin
usuario.nombreVisible
programaData.participantes
programaData.pago
________________________________________
6. Sección PARTICIPANTES — programa
UI:
Nil Pons

Períodos:
- Semana 1
- Semana 2

Servicios:
- Comedor
- Transporte

Alertas:
- Tiene restricciones alimentarias
- Tiene salud cargada
Campos:
programaData.participantes[].nombreCompleto
programaData.participantes[].periodos
programaData.participantes[].servicios
programaData.participantes[].tieneRestricciones
programaData.participantes[].tieneSaludCargada
________________________________________
7. Sección PAGOS — programa
UI:
Total original: 343 EUR
Pagado: 100 EUR
Saldo: 243 EUR
Estado: PARCIAL
Campos:
programaData.pago.totalOriginal
programaData.pago.totalPagado
programaData.pago.saldo
programaData.pago.moneda
programaData.pago.estadoPago
________________________________________
8. Sección QR RETIRO — programa
UI:
Marta Puig
Madre
+34600777111

QR visual generado por front con:
qrToken

Puede retirar:
- Nil Pons
- Ona Pons
Campos:
programaData.qrsRetiro[].nombreAutorizado
programaData.qrsRetiro[].telefonoAutorizado
programaData.qrsRetiro[].relacion
programaData.qrsRetiro[].qrToken
programaData.qrsRetiro[].participantes
Importante:
El backend no devuelve imagen QR.
Devuelve qrToken.
El front genera el QR visual.
________________________________________
9. Sección RETIROS — programa
UI:
24/06/2026
Nil Pons fue retirado por Marta Puig
17:00

25/06/2026
Ona Pons fue retirada por Jordi Puig
16:45
Campos:
programaData.retiros[].participante
programaData.retiros[].nombreRetirador
programaData.retiros[].fechaRetiro
programaData.retiros[].fechaOperativa
________________________________________
10. Sección SALUD / ACCIONES — programa
UI:
Nil Pons
24/06/2026 14:30

INCIDENTE_LEVE
Dolor de cabeza. Se dejó descansar 20 minutos.

Contacto familia: Sí
Contacto realizado: Sí
Seguimiento: No
Campos:
programaData.saludAcciones[].participante
programaData.saludAcciones[].fechaHora
programaData.saludAcciones[].tipoAccion
programaData.saludAcciones[].descripcion
programaData.saludAcciones[].requirioContactoFamilia
programaData.saludAcciones[].contactoRealizado
programaData.saludAcciones[].requiereSeguimiento
________________________________________
11. Sección FOTOS — programa
UI:
Fotos del programa

[Foto]
Actividad de piscina
24/06/2026
Grupo de la mañana
Campos:
programaData.fotos[].urlFoto
programaData.fotos[].titulo
programaData.fotos[].descripcion
programaData.fotos[].fechaFoto
________________________________________
12. JSON completo — Portal Programa
{
  "tipoPortal": "PROGRAMA",
  "idEvento": 34,
  "evento": {
    "titulo": "Casal Aquamar 2026",
    "mensajeBienvenida": "Bienvenidos al casal de verano.",
    "anfitrionesTexto": "Aquamar",
    "fechaEvento": null,
    "fechaInicio": "2026-06-22",
    "fechaFin": "2026-09-04",
    "tipoOperacion": "PROGRAMA"
  },
  "usuario": {
    "nombreVisible": "Mireia Pons",
    "email": "mireia.pons@test.com",
    "telefono": "+34600777111"
  },
  "secciones": [
    {
      "codigo": "RESUMEN",
      "titulo": "Resumen",
      "visible": true,
      "orden": 1,
      "configJson": null
    },
    {
      "codigo": "PARTICIPANTES",
      "titulo": "Mis hijos",
      "visible": true,
      "orden": 2,
      "configJson": null
    },
    {
      "codigo": "PAGOS",
      "titulo": "Pagos",
      "visible": true,
      "orden": 3,
      "configJson": null
    },
    {
      "codigo": "QRS_RETIRO",
      "titulo": "QR de retiro",
      "visible": true,
      "orden": 4,
      "configJson": null
    },
    {
      "codigo": "RETIROS",
      "titulo": "Retiros",
      "visible": true,
      "orden": 5,
      "configJson": null
    },
    {
      "codigo": "SALUD_ACCIONES",
      "titulo": "Salud / avisos",
      "visible": true,
      "orden": 6,
      "configJson": null
    },
    {
      "codigo": "FOTOS",
      "titulo": "Fotos",
      "visible": true,
      "orden": 7,
      "configJson": null
    }
  ],
  "programaData": {
    "idInscripcion": 20,
    "idRsvpGrupo": 44,
    "pago": {
      "totalOriginal": 343.0,
      "totalPagado": 100.0,
      "saldo": 243.0,
      "moneda": "EUR",
      "estadoPago": "PARCIAL"
    },
    "participantes": [
      {
        "idInvitado": 201,
        "idRsvpGrupoIntegrante": 91,
        "nombreCompleto": "Nil Pons",
        "periodos": ["Semana 1", "Semana 2"],
        "servicios": ["Menjador", "Transport"],
        "tieneRestricciones": true,
        "tieneSaludCargada": true
      },
      {
        "idInvitado": 202,
        "idRsvpGrupoIntegrante": 92,
        "nombreCompleto": "Ona Pons",
        "periodos": ["Semana 1"],
        "servicios": ["Menjador"],
        "tieneRestricciones": false,
        "tieneSaludCargada": true
      }
    ],
    "qrsRetiro": [
      {
        "nombreAutorizado": "Mireia Pons",
        "telefonoAutorizado": "+34600777111",
        "relacion": "Madre",
        "qrToken": "QR_TOKEN_MIREIA",
        "participantes": ["Nil Pons", "Ona Pons"]
      },
      {
        "nombreAutorizado": "Jordi Puig",
        "telefonoAutorizado": "+34600777222",
        "relacion": "Tío",
        "qrToken": "QR_TOKEN_JORDI",
        "participantes": ["Nil Pons"]
      }
    ],
    "retiros": [
      {
        "idRetiro": 7,
        "participante": "Nil Pons",
        "nombreRetirador": "Mireia Pons",
        "fechaRetiro": "2026-06-24T17:00:00+00:00",
        "fechaOperativa": "2026-06-24"
      }
    ],
    "saludAcciones": [
      {
        "idAccionSalud": 3,
        "idParticipante": 201,
        "participante": "Nil Pons",
        "fechaHora": "2026-06-24T14:30:00+00:00",
        "tipoAccion": "INCIDENTE_LEVE",
        "descripcion": "Dolor de cabeza. Se dejó descansar 20 minutos.",
        "requirioContactoFamilia": true,
        "contactoRealizado": true,
        "requiereSeguimiento": false
      }
    ],
    "fotos": [
      {
        "idPortalFoto": 1,
        "titulo": "Actividad de piscina",
        "descripcion": "Grupo de la mañana",
        "urlFoto": "https://storage.eventia.app/aquamar/piscina-2026-06-24.jpg",
        "fechaFoto": "2026-06-24"
      }
    ]
  },
  "eventoPrivadoData": null,
  "eventoPublicoData": null
}
________________________________________
13. Pantalla pública — Portal Boda
URL
/portal/:rsvpToken
Layout
Boda de Sol y Rodri

Hola Lucía Pérez

Secciones:
Resumen
Agenda
Música
Álbum
Regalos
Hospedajes
Fotos
Sección AGENDA
Usa:
eventoPrivadoData.agenda
UI:
Iglesia
19:00
Parroquia San José

Cena
21:00
Salón Las Rosas

Fiesta
23:30
Salón Las Rosas
Sección RSVP
Usa:
eventoPrivadoData.rsvpEstado
eventoPrivadoData.rsvpMensaje
Sección QR ingreso
Usa:
eventoPrivadoData.qrToken
________________________________________
14. JSON completo — Portal Boda
{
  "tipoPortal": "EVENTO_PRIVADO",
  "idEvento": 80,
  "evento": {
    "titulo": "Boda de Sol y Rodri",
    "mensajeBienvenida": "Gracias por acompañarnos en este día tan especial.",
    "anfitrionesTexto": "Sol y Rodri",
    "fechaEvento": "2026-11-22T19:00:00-03:00",
    "fechaInicio": null,
    "fechaFin": null,
    "tipoOperacion": "EVENTO"
  },
  "usuario": {
    "nombreVisible": "Lucía Pérez",
    "email": "lucia@test.com",
    "telefono": "+5492235550000"
  },
  "secciones": [
    {
      "codigo": "RESUMEN",
      "titulo": "Resumen",
      "visible": true,
      "orden": 1,
      "configJson": null
    },
    {
      "codigo": "AGENDA",
      "titulo": "Agenda",
      "visible": true,
      "orden": 2,
      "configJson": null
    },
    {
      "codigo": "MUSICA",
      "titulo": "Música",
      "visible": true,
      "orden": 3,
      "configJson": null
    },
    {
      "codigo": "ALBUM",
      "titulo": "Álbum",
      "visible": true,
      "orden": 4,
      "configJson": null
    },
    {
      "codigo": "REGALOS",
      "titulo": "Regalos",
      "visible": true,
      "orden": 5,
      "configJson": null
    },
    {
      "codigo": "HOSPEDAJES",
      "titulo": "Hospedajes",
      "visible": true,
      "orden": 6,
      "configJson": null
    }
  ],
  "programaData": null,
  "eventoPrivadoData": {
    "idInvitado": 500,
    "rsvpEstado": "Y",
    "rsvpMensaje": "¡Ahí estaremos!",
    "qrToken": "QR_INVITADO_500",
    "agenda": [
      {
        "idTramo": 10,
        "nombre": "Iglesia",
        "fechaHoraInicio": "2026-11-22T19:00:00-03:00",
        "fechaHoraFin": "2026-11-22T20:00:00-03:00",
        "lugar": "Parroquia San José"
      },
      {
        "idTramo": 11,
        "nombre": "Cena",
        "fechaHoraInicio": "2026-11-22T21:00:00-03:00",
        "fechaHoraFin": "2026-11-22T23:30:00-03:00",
        "lugar": "Salón Las Rosas"
      }
    ],
    "fotos": [
      {
        "idPortalFoto": 9,
        "titulo": "Save the date",
        "descripcion": "Nos casamos",
        "urlFoto": "https://storage.eventia.app/boda/save-the-date.jpg",
        "fechaFoto": null
      }
    ]
  },
  "eventoPublicoData": null
}
________________________________________
15. Pantalla pública — Portal Tardeo
URL
/portal/:tokenCampania
Layout
Tardeo Sunset

Tu acceso:
Lista VIP

Beneficio:
Acceso preferencial + consumición

Válido hasta:
04/05/2026 01:00

Mensaje:
Tu acceso preferencial quedó confirmado.
________________________________________
16. JSON completo — Portal Tardeo
{
  "tipoPortal": "EVENTO_PUBLICO",
  "idEvento": 90,
  "evento": {
    "titulo": "Tardeo Sunset",
    "mensajeBienvenida": "Gracias por registrarte.",
    "anfitrionesTexto": "Mar Cambrils",
    "fechaEvento": "2026-05-03T19:00:00-03:00",
    "fechaInicio": null,
    "fechaFin": null,
    "tipoOperacion": "EVENTO"
  },
  "usuario": {
    "nombreVisible": "Lista VIP",
    "email": null,
    "telefono": null
  },
  "secciones": [
    {
      "codigo": "RESUMEN",
      "titulo": "Resumen",
      "visible": true,
      "orden": 1,
      "configJson": null
    },
    {
      "codigo": "ACCESO_BENEFICIO",
      "titulo": "Tu beneficio",
      "visible": true,
      "orden": 2,
      "configJson": null
    },
    {
      "codigo": "QR_INGRESO",
      "titulo": "QR de ingreso",
      "visible": true,
      "orden": 3,
      "configJson": null
    }
  ],
  "programaData": null,
  "eventoPrivadoData": null,
  "eventoPublicoData": {
    "idAccesoLink": 13,
    "tituloCampania": "Lista VIP",
    "leyendaPublica": "Acceso exclusivo para invitados especiales.",
    "beneficioTitulo": "Acceso VIP",
    "beneficioDescripcion": "Ingreso preferencial con consumición incluida.",
    "beneficioHasta": "2026-05-04T01:00:00+00:00",
    "mensajePostRegistro": "Tu acceso VIP quedó reservado.",
    "fotos": [
      {
        "idPortalFoto": 12,
        "titulo": "Sunset",
        "descripcion": "Mood del evento",
        "urlFoto": "https://storage.eventia.app/tardeo/sunset.jpg",
        "fechaFoto": null
      }
    ]
  }
}
________________________________________
17. Reglas para renderizar secciones
El front no decide qué se muestra.
Hace esto:
1. GET /portal/{token}
2. Lee secciones ordenadas por orden
3. Por cada seccion.codigo renderiza el componente correspondiente
4. Si no conoce el código, lo ignora
Mapa de componentes:
RESUMEN              → PortalResumen
AGENDA               → PortalAgenda
PARTICIPANTES        → PortalParticipantes
PAGOS                → PortalPagos
QRS_RETIRO           → PortalQrRetiro
RETIROS              → PortalRetiros
SALUD_ACCIONES       → PortalSaludAcciones
FOTOS                → PortalFotos
MUSICA               → PortalMusica
ALBUM                → PortalAlbum
HOSPEDAJES           → PortalHospedajes
REGALOS              → PortalRegalos
ACCESO_BENEFICIO     → PortalBeneficio
QR_INGRESO           → PortalQrIngreso
________________________________________
18. Pantalla admin — configuración del portal
Ruta sugerida:
Evento / Programa
└── Configuración
    └── Portal
Tabs:
Secciones
Fotos
Tab Secciones
Orden | Sección | Título visible | Visible | Requiere feature
1     | RESUMEN | Resumen        | Sí      | —
2     | PAGOS   | Pagos          | Sí      | —
Acciones:
editar título
cambiar orden
activar/desactivar
guardar
Endpoint:
GET /eventos/{idEvento}/portal/config
PUT /eventos/{idEvento}/portal/config
Tab Fotos
Miniatura | Título | Fecha | Visible portal | Activo | Acciones
Endpoint:
GET /eventos/{idEvento}/portal/fotos
POST /eventos/{idEvento}/portal/fotos/upsert
PUT /eventos/portal/fotos/{idPortalFoto}/set-visible?visible=false
PUT /eventos/portal/fotos/{idPortalFoto}/set-activo?activo=false
________________________________________
19. Cierre funcional del módulo
Con esto queda cerrado:
✔ Portal único por token
✔ Programa / familia
✔ Evento privado / boda
✔ Evento público / tardeo
✔ Secciones configurables
✔ Fotos internas
✔ Salud acciones visible para padres
✔ QR retiro visible para padres
✔ Historial de retiros visible para padres
✔ Pago visible para padres
________________________________________
Falta solo un último bloque si querés dejarlo redondo:
BLOQUE 6 — checklist de implementación + errores probables de compile + ajustes si tus entities tienen nombres distintos



🧪 BLOQUE 6 — CHECKLIST FINAL DE IMPLEMENTACIÓN
✅ 1. Base de datos
Verificá que EXISTAN:
✔ ef_param_portal_secciones
✔ ef_evento_portal_config
✔ ef_evento_portal_fotos
Y que tengan datos:
select * from ef_param_portal_secciones;
Si está vacío → NO VA A MOSTRAR NADA.
________________________________________
✅ 2. DataContext
public DbSet<ef_param_portal_secciones> ef_param_portal_secciones { get; set; }
public DbSet<ef_evento_portal_config> ef_evento_portal_config { get; set; }
public DbSet<ef_evento_portal_fotos> ef_evento_portal_fotos { get; set; }
Y configuraciones:
modelBuilder.ApplyConfiguration(new ef_param_portal_seccionesConfiguration());
modelBuilder.ApplyConfiguration(new ef_evento_portal_configConfiguration());
modelBuilder.ApplyConfiguration(new ef_evento_portal_fotosConfiguration());
________________________________________
✅ 3. Token en inscripción
CRÍTICO:
if (string.IsNullOrWhiteSpace(inscripcion.token_consulta))
{
    inscripcion.token_consulta = Guid.NewGuid().ToString("N");
}
Si esto no está → el portal no existe.
________________________________________
✅ 4. Endpoint funcionando
GET /portal/{token}
Probá con:
token_consulta real
Si devuelve 404:
→ token mal
→ activo = false
→ no guardaste inscripción
________________________________________
🚨 ERRORES TÍPICOS (TE VAN A PASAR)
❌ 1. "no contiene definición para X"
Ejemplo:
ef_evento_tramos no contiene fecha_hora_inicio
✔ Solución
Buscá tu entity y adaptá nombres:
// TU ENTITY
fecha_inicio → reemplaza fecha_hora_inicio
fecha_fin → reemplaza fecha_hora_fin
________________________________________
❌ 2. "tipo_operacion no existe"
En ef_eventos
✔ Solución
Si no lo tenés:
public string tipo_operacion { get; set; } = "EVENTO";
O reemplazá lógica por:
esPrograma = id_tipo_evento en lista de programas
________________________________________
❌ 3. "beneficio_titulo no existe"
En:
ef_evento_acceso_links
✔ Solución rápida
Comentá estas líneas:
BeneficioTitulo = link.beneficio_titulo,
BeneficioDescripcion = link.beneficio_descripcion,
BeneficioHasta = link.beneficio_hasta,
MensajePostRegistro = link.mensaje_post_registro,
Y listo para demo.
________________________________________
❌ 4. DateOnly error
No se puede convertir DateTime a DateOnly
✔ Solución
DateOnly.FromDateTime(x.fecha)
________________________________________
❌ 5. bool? → bool
Ya te pasó:
salud.tiene_problema_medico ? ...
✔ solución
(salud.tiene_problema_medico ?? false)
________________________________________
❌ 6. navegación null
inv.nombre + inv.apellido rompe
✔ solución
(inv.nombre ?? "") + " " + (inv.apellido ?? "")
________________________________________
❌ 7. roles
Si rompe acá:
r.codigo == "EVENT_OWNER"
✔ quick fix
Comentá validación y dejá:
return true;
(para demo)
________________________________________
🔧 AJUSTES SEGÚN TU MODELO (IMPORTANTES)
🔹 ef_evento_tramos
Esperado:
nombre
fecha_hora_inicio
fecha_hora_fin
lugar
Si tenés:
fecha_inicio / fecha_fin → reemplazar
descripcion → usar como nombre
________________________________________
🔹 ef_programa_salud_acciones
Esperado:
tipo_accion
descripcion
fecha_hora
Si no coincide:
tipo → usar
detalle → usar como descripcion
________________________________________
🔹 ef_evento_acceso_links
Puede no tener:
beneficio_*
mensaje_post_registro
No pasa nada → es opcional.
________________________________________
🧠 REGLA DE ORO
No intentes adaptar la DB a este código.
👉 Adaptá el código a TU DB.
________________________________________
🧪 PRUEBA FINAL (HACÉ ESTO MAÑANA)
1. Confirmar inscripción
POST /programas/inscripcion/{token}/confirmar
✔ guardar response
________________________________________
2. Abrir portal
GET /portal/{token_consulta}
✔ debe devolver JSON completo
________________________________________
3. Probar fotos
POST /eventos/{idEvento}/portal/fotos/upsert
✔ subir 1 foto
________________________________________
4. Volver a portal
GET /portal/{token}
✔ foto aparece
________________________________________
5. Configurar secciones
PUT /eventos/{idEvento}/portal/config
✔ apagar una sección
________________________________________
6. Volver a portal
✔ sección desaparece
________________________________________
🧠 REALIDAD (te lo digo directo)
Si mañana esto levanta:
portal funcionando
QR funcionando
retiros funcionando
salud visible
fotos visibles
👉 ya tenés algo MUCHO más potente que cualquier app de colonias.
________________________________________
🚀 SIGUIENTE PASO (cuando esto funcione)
No código.
👉 DEMO.
Porque esto:
NO es un sistema técnico
es un producto vendible
________________________________________
🧨 CIERRE
Te soy honesto:
Esto ya no es un módulo.
Es EL diferencial de Eventia

