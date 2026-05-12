using API.DataSchema;
using API.DataSchema.DTO;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Services
{
    public class AuthContextService
    {
        private readonly DataContext _context;

        public AuthContextService(DataContext context)
        {
            _context = context;
        }

        public async Task<Auth_me_responseDTO> GetContext(long id_usuario)
        {
            // =========================
            // 1. USUARIO
            // =========================
            var usuario = await _context.ef_usuarios
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.id_usuario == id_usuario);

            if (usuario == null)
                throw new Exception("Usuario no encontrado.");

            if (!usuario.activo)
                throw new Exception("Tu cuenta está deshabilitada. Contacta con soporte.");

            // =========================
            // 2. ROLES GLOBALES
            // =========================
            var roles_globales = await (
                from ur in _context.ef_usuarios_roles.AsNoTracking()
                join r in _context.ef_roles.AsNoTracking() on ur.id_rol equals r.id_rol
                where ur.id_usuario == id_usuario && ur.activo
                select r.codigo
            ).ToListAsync();

            // =========================
            // 3. EVENTOS DEL USUARIO
            // =========================
            var eventos_usuario = await (
                from eu in _context.ef_evento_usuarios.AsNoTracking()
                join r in _context.ef_roles.AsNoTracking() on eu.id_rol equals r.id_rol
                join e in _context.ef_eventos.AsNoTracking() on eu.id_evento equals e.id_evento
                where eu.id_usuario == id_usuario && eu.activo
                select new
                {
                    eu.id_evento,
                    rol_codigo = r.codigo,
                    estado_evento = e.estado
                }
            ).ToListAsync();

            var cantidad_propios = eventos_usuario.Count(x => x.rol_codigo == "EVENT_OWNER");
            var cantidad_compartidos = eventos_usuario.Count(x =>
                x.rol_codigo == "EVENT_HOST" || x.rol_codigo == "EVENT_CLIENT_ADMIN");

            // Regla B2C: puede crear evento si NO tiene borradores propios
            var cantidad_borradores_propios = eventos_usuario.Count(x =>
                x.rol_codigo == "EVENT_OWNER" && x.estado_evento == "B");

            var puede_crear_evento_b2c = cantidad_borradores_propios == 0;

            // =========================
            // 4. CUENTA DEL USUARIO
            // =========================
            // Para esta primera versión tomo una sola cuenta por usuario.
            // Si más adelante abrís multi-cuenta, esto se transforma en lista.
            var cuenta_row = await (
                from cu in _context.ef_cuenta_usuarios.AsNoTracking()
                join c in _context.ef_cuentas.AsNoTracking() on cu.id_cuenta equals c.id_cuenta
                join r in _context.ef_roles.AsNoTracking() on cu.id_rol equals r.id_rol
                join p in _context.ef_planes.AsNoTracking() on c.id_plan equals p.id_plan into planes
                from p in planes.DefaultIfEmpty()
                where cu.id_usuario == id_usuario
                orderby cu.id_cuenta_usuario descending
                select new
                {
                    c.id_cuenta,
                    c.nombre_cuenta,
                    c.tipo,
                    c.estado,
                    c.id_plan,
                    plan_codigo = p != null ? p.codigo : null,
                    rol_cuenta = r.codigo,
                    vinculo_activo = cu.activo
                }
            ).FirstOrDefaultAsync();

            cuenta_me cuenta = new cuenta_me();

            if (cuenta_row == null)
            {
                cuenta.estado_ui = "SIN_CUENTA";
                cuenta.id_cuenta = null;
                cuenta.nombre_cuenta = null;
                cuenta.tipo = null;
                cuenta.estado = null;
                cuenta.id_plan = null;
                cuenta.plan_codigo = null;
                cuenta.rol_cuenta = null;
                cuenta.vinculo_activo = null;
            }
            else
            {
                cuenta.id_cuenta = cuenta_row.id_cuenta;
                cuenta.nombre_cuenta = cuenta_row.nombre_cuenta;
                cuenta.tipo = cuenta_row.tipo;
                cuenta.estado = cuenta_row.estado;
                cuenta.id_plan = cuenta_row.id_plan;
                cuenta.plan_codigo = cuenta_row.plan_codigo;
                cuenta.rol_cuenta = cuenta_row.rol_cuenta;
                cuenta.vinculo_activo = cuenta_row.vinculo_activo;

                if (cuenta_row.estado == "P")
                    cuenta.estado_ui = "CUENTA_PENDIENTE";
                else if (cuenta_row.estado == "A")
                    cuenta.estado_ui = "CUENTA_ACTIVA";
                else if (cuenta_row.estado == "S")
                    cuenta.estado_ui = "CUENTA_SUSPENDIDA";
                else
                    cuenta.estado_ui = "SIN_CUENTA";
            }

            // =========================
            // 5. UI FLAGS
            // =========================
            var ui = new ui_me
            {
                mostrar_solicitar_cuenta = cuenta.estado_ui == "SIN_CUENTA",
                mostrar_estado_cuenta_pendiente = cuenta.estado_ui == "CUENTA_PENDIENTE",
                mostrar_menu_cuenta = cuenta.estado_ui == "CUENTA_ACTIVA",
                mostrar_admin = roles_globales.Contains("SUPERADMIN"),
                puede_crear_evento_b2c = puede_crear_evento_b2c
            };

            // =========================
            // 6. RESPONSE
            // =========================
            return new Auth_me_responseDTO
            {
                usuario = new usuario_me
                {
                    id_usuario = usuario.id_usuario,
                    email = usuario.email,
                    nombre = usuario.nombre,
                    apellido = usuario.apellido
                },
                roles_globales = roles_globales,
                cuenta = cuenta,
                eventos = new eventos_me
                {
                    cantidad_propios = cantidad_propios,
                    cantidad_compartidos = cantidad_compartidos
                },
                ui = ui
            };
        }
    }
}