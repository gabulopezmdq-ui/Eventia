using API.DataSchema;
using API.DataSchema.DTO;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

public class RelacionesPersonaService : IRelacionesPersonaService
{
    private readonly DataContext _context;

    public RelacionesPersonaService(DataContext context)
    {
        _context = context;
    }

    public async Task<List<RelacionPersonaComboDTO>> ComboAsync(int idIdioma, string uso)
    {
        if (string.IsNullOrWhiteSpace(uso))
            throw new Exception("Debe informar el uso.");

        uso = uso.Trim().ToUpper();

        var query =
            from r in _context.ef_param_relaciones_persona
            from t in _context.ef_param_traducciones
                .Where(t =>
                    t.entidad == "RELACION_PERSONA" &&
                    t.id_item == r.id_relacion_persona &&
                    t.id_idioma == idIdioma &&
                    t.activo == true)
            where r.activo == true
            select new { r, t };

        if (uso == "RESPONSABLE_INSCRIPCION")
            query = query.Where(x => x.r.permite_responsable_inscripcion);
        else if (uso == "AUTORIZADO_RETIRO")
            query = query.Where(x => x.r.permite_autorizado_retiro);
        else if (uso == "RSVP_GRUPO")
            query = query.Where(x => x.r.permite_rsvp_grupo);
        else
            throw new Exception("Uso inválido. Valores permitidos: RESPONSABLE_INSCRIPCION, AUTORIZADO_RETIRO, RSVP_GRUPO.");

        return await query
            .OrderBy(x => x.r.orden)
            .Select(x => new RelacionPersonaComboDTO
            {
                id_relacion_persona = x.r.id_relacion_persona,
                codigo = x.r.codigo,
                texto = x.t.texto
            })
            .ToListAsync();
    }
}