using API.DataSchema;
using API.DataSchema.DTO;
using API.Domain;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;


namespace API.Services
{
    public class QrService : IQrService
    {
        private readonly DataContext _context;

        public QrService(DataContext context)
        {
            _context = context;
        }

        public async Task<QrScanResponseDTO?> GetByQrTokenAsync(string qrToken)
        {
            try
            {
                Console.WriteLine($"========== INICIO GetByQrTokenAsync ==========");
                Console.WriteLine($"QR Token: {qrToken}");

                // 1) Invitado por QR
                Console.WriteLine("Buscando invitado...");
                var inv = await _context.Set<ef_invitados>()
                    .AsNoTracking()
                    .SingleOrDefaultAsync(i => i.qr_token == qrToken);

                if (inv == null)
                {
                    Console.WriteLine("Invitado NO encontrado");
                    return null;
                }

                Console.WriteLine($"Invitado encontrado: ID={inv.id_invitado}, Nombre={inv.nombre}, Grupo={inv.id_rsvp_grupo}");

                // 2) Buscar rol_evento desde integrantes
                string rolEvento = "A";
                long? idGrupo = null;

                if (inv.id_rsvp_grupo != null)
                {
                    Console.WriteLine($"Buscando en ef_rsvp_grupo_integrantes con grupo={inv.id_rsvp_grupo}, invitado={inv.id_invitado}");

                    idGrupo = inv.id_rsvp_grupo;
                    var integrante = await _context.Set<ef_rsvp_grupo_integrantes>()
                        .AsNoTracking()
                        .Where(x => x.id_rsvp_grupo == idGrupo && x.id_invitado == inv.id_invitado)
                        .Select(x => x.rol_evento)
                        .SingleOrDefaultAsync();

                    Console.WriteLine($"Rol encontrado: {integrante ?? "NULL"}");
                    rolEvento = integrante ?? "A";
                }
                else
                {
                    Console.WriteLine("inv.id_rsvp_grupo es NULL");
                }

                // 3) Autorizados de retiro
                List<AutorizacionDTO> autorizados = new();
                Console.WriteLine($"RolEvento: {rolEvento}");

                if (rolEvento == "N")
                {
                    Console.WriteLine("Es niño, buscando autorizaciones...");
                    autorizados = await _context.Set<ef_autorizaciones>()
                        .AsNoTracking()
                        .Where(x => x.id_evento == inv.id_evento
                                    && x.id_invitado_objetivo == inv.id_invitado
                                    && x.tipo == "R"
                                    && x.activo)
                        .OrderBy(x => x.nombre_autorizado)
                        .Select(x => new AutorizacionDTO
                        {
                            IdAutorizacion = x.id_autorizacion,
                            IdEvento = x.id_evento,
                            IdInvitadoObjetivo = x.id_invitado_objetivo,
                            Tipo = x.tipo,
                            NombreAutorizado = x.nombre_autorizado,
                            TelefonoAutorizado = x.telefono_autorizado,
                            IdRelacionPersona = x.id_relacion_persona,
                            Observaciones = x.observaciones,
                            Activo = x.activo
                        })
                        .ToListAsync();

                    Console.WriteLine($"Autorizaciones encontradas: {autorizados.Count}");
                }

                // 4) Resumen del grupo
                string? resumen = null;
                if (idGrupo != null)
                {
                    Console.WriteLine($"Generando resumen para grupo {idGrupo}");

                    var integrantes = await _context.Set<ef_rsvp_grupo_integrantes>()
                        .AsNoTracking()
                        .Where(x => x.id_rsvp_grupo == idGrupo)
                        .Join(_context.Set<ef_invitados>(),
                              x => x.id_invitado,
                              i => i.id_invitado,
                              (x, i) => new { x.rol_evento, i.nombre, i.apellido })
                        .ToListAsync();

                    Console.WriteLine($"Integrantes encontrados: {integrantes.Count}");

                    var menores = integrantes.Where(x => x.rol_evento == "N").ToList();
                    var responsable = integrantes.FirstOrDefault(x => x.rol_evento == "R");

                    Console.WriteLine($"Menores: {menores.Count}, Responsable: {(responsable != null ? "SÍ" : "NO")}");

                    if (menores.Any() && responsable != null)
                    {
                        var nombresMenores = string.Join(", ", menores.Select(m => $"{m.nombre} {m.apellido}"));
                        resumen = $"Menores: {nombresMenores} | Resp: {responsable.nombre} {responsable.apellido}";
                    }
                    else if (menores.Any())
                    {
                        var nombresMenores = string.Join(", ", menores.Select(m => $"{m.nombre} {m.apellido}"));
                        resumen = $"Menores: {nombresMenores}";
                    }
                    else if (responsable != null)
                    {
                        resumen = $"Responsable: {responsable.nombre} {responsable.apellido}";
                    }
                }

                Console.WriteLine($"Construyendo respuesta final...");
                var response = new QrScanResponseDTO
                {
                    IdEvento = inv.id_evento,
                    IdInvitado = inv.id_invitado,
                    Nombre = inv.nombre,
                    Apellido = inv.apellido,
                    RolEvento = rolEvento,
                    RsvpEstado = inv.rsvp_estado,
                    IdRsvpGrupo = idGrupo,
                    GrupoResumen = resumen,
                    AutorizadosRetiro = autorizados
                };

                Console.WriteLine($"Response construido: ID={response.IdInvitado}, Nombre={response.Nombre}");
                Console.WriteLine($"========== FIN GetByQrTokenAsync ==========");

                return response;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ERROR en GetByQrTokenAsync: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
                throw; // Re-lanzamos para que el controller lo capture
            }
        }
    }
}