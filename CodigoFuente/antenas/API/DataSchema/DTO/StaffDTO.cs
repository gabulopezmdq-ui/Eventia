using API.DataSchema.DTO.Eventos;
using System;
using System.Collections.Generic;

namespace API.DataSchema.DTO.Staff
{
    // ──────────────────────────────────────
    // REQUEST: Crear Staff
    // ──────────────────────────────────────
    public class CrearStaffRequest
    {
        public long id_cuenta { get; set; }
        public short id_rol { get; set; }

        // Datos personales registrados por el Admin
        public string? nombre { get; set; }
        public string? apellido { get; set; }
        public string? email { get; set; }
        public string? telefono { get; set; }

        public DateTimeOffset? fecha_expiracion { get; set; }
        public List<long>? id_unidades { get; set; }
    }

    // ──────────────────────────────────────
    // RESPONSE: Staff creado (incluye el código)
    // ──────────────────────────────────────
    public class StaffCreadoDTO
    {
        public long id_staff { get; set; }
        public string codigo { get; set; } = null!;
        public string? nombre { get; set; }
        public string? apellido { get; set; }
        public DateTimeOffset? fecha_expiracion { get; set; }
    }

    // ──────────────────────────────────────
    // RESPONSE: Lista de Staff
    // ──────────────────────────────────────
    public class StaffListItemDTO
    {
        public long id_staff { get; set; }
        public string? nombre { get; set; }
        public string? apellido { get; set; }
        public string? email { get; set; }
        public string? telefono { get; set; }
        public string rol_codigo { get; set; } = null!;
        public string? rol_descripcion { get; set; }
        public string codigo { get; set; } = null!;
        public bool activo { get; set; }
        public DateTimeOffset? fecha_expiracion { get; set; }
        public int usos { get; set; }
        public DateTimeOffset? fecha_uso { get; set; }
    }

    // ──────────────────────────────────────
    // RESPONSE: Contexto del empleado al usar su código
    // ──────────────────────────────────────
    public class StaffContextoDTO
    {
        public long id_staff { get; set; }
        public long? id_cuenta { get; set; }
        public long? id_evento { get; set; }

        public string? nombre { get; set; }
        public string? apellido { get; set; }
        public string? display_name { get; set; }

        public string? tipo_operacion { get; set; }

        public List<StaffJoinRolDTO> roles_evento { get; set; } = new();
        public string? pantalla_inicio_default { get; set; }

        public List<StaffUnidadDTO> unidades { get; set; } = new();

        public string access_token { get; set; } = null!;
        public DateTimeOffset expires_at_utc { get; set; }
    }

    public class StaffUnidadDTO
    {
        public long id_unidad { get; set; }
        public string nombre { get; set; } = null!;
    }
}