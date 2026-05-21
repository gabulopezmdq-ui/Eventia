using API.DataSchema;
using API.DataSchema.DTO.Roles;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Services.Roles
{
    public class RolesService : IRolesService
    {
        private readonly DataContext _context;

        public RolesService(DataContext context)
        {
            _context = context;
        }

        public async Task<List<RolComboDTO>> GetComboEquipoAsync(short idIdioma, string tipoOperacion)
        {
            tipoOperacion = NormalizarTipoOperacion(tipoOperacion);

            var result = await (
                from r in _context.Set<ef_roles>().AsNoTracking()
                where r.activo
                      && r.asignable_equipo_evento
                      && r.requiere_usuario
                      && (r.aplica_tipo_operacion == "AMBOS" || r.aplica_tipo_operacion == tipoOperacion)
                orderby r.orden_ui, r.id_rol
                select new RolComboDTO
                {
                    id_rol = r.id_rol,
                    codigo = r.codigo,
                    texto = _context.Set<ef_param_traducciones>()
                        .Where(tr =>
                            tr.entidad == "ROL_NOMBRE" &&
                            tr.id_item == r.id_rol &&
                            tr.id_idioma == idIdioma &&
                            tr.activo)
                        .Select(tr => tr.texto)
                        .FirstOrDefault() ?? r.codigo,
                    categoria = r.categoria,
                    aplica_tipo_operacion = r.aplica_tipo_operacion,
                    requiere_usuario = r.requiere_usuario,
                    permite_codigo_staff = r.permite_codigo_staff,
                    pantalla_inicio = r.pantalla_inicio,
                    orden_ui = r.orden_ui
                }
            ).ToListAsync();

            return result;
        }

        public async Task<List<RolComboDTO>> GetComboStaffAsync(short idIdioma, string tipoOperacion)
        {
            tipoOperacion = NormalizarTipoOperacion(tipoOperacion);

            var result = await (
                from r in _context.Set<ef_roles>().AsNoTracking()
                where r.activo
                      && r.asignable_staff_operativo
                      && r.permite_codigo_staff
                      && !r.requiere_usuario
                      && (r.aplica_tipo_operacion == "AMBOS" || r.aplica_tipo_operacion == tipoOperacion)
                orderby r.orden_ui, r.id_rol
                select new RolComboDTO
                {
                    id_rol = r.id_rol,
                    codigo = r.codigo,
                    texto = _context.Set<ef_param_traducciones>()
                        .Where(tr =>
                            tr.entidad == "ROL_NOMBRE" &&
                            tr.id_item == r.id_rol &&
                            tr.id_idioma == idIdioma &&
                            tr.activo)
                        .Select(tr => tr.texto)
                        .FirstOrDefault() ?? r.codigo,
                    categoria = r.categoria,
                    aplica_tipo_operacion = r.aplica_tipo_operacion,
                    requiere_usuario = r.requiere_usuario,
                    permite_codigo_staff = r.permite_codigo_staff,
                    pantalla_inicio = r.pantalla_inicio,
                    orden_ui = r.orden_ui
                }
            ).ToListAsync();

            return result;
        }

        private string NormalizarTipoOperacion(string? tipoOperacion)
        {
            var valor = (tipoOperacion ?? "EVENTO").Trim().ToUpperInvariant();

            if (valor != "EVENTO" && valor != "PROGRAMA")
                valor = "EVENTO";

            return valor;
        }
    }
}