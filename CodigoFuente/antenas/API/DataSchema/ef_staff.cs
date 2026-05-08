using System;

namespace API.DataSchema
{
    public class ef_staff
    {
        public long id_staff { get; set; }

        /// <summary>Cuenta propietaria (Salón, Planner, etc.)</summary>
        public long? id_cuenta { get; set; }

        /// <summary>Evento específico (si es un evento personal B2C sin cuenta)</summary>
        public long? id_evento { get; set; }

        /// <summary>Unidad operativa principal asignada</summary>
        public long? id_unidad { get; set; }

        /// <summary>Rol: STAFF_DJ, STAFF_RECEPTOR, STAFF_BARTENDER, STAFF_MESERO, etc.</summary>
        public short id_rol { get; set; }

        /// <summary>
        /// Código alfanumérico único. Es el acceso del empleado.
        /// 10 caracteres sin guiones. Ej: AX4JD92KBT
        /// </summary>
        public string codigo { get; set; } = null!;

        // ─── Datos personales (cargados por el admin al crear el perfil) ─────────
        /// <summary>Nombre del empleado</summary>
        public string? nombre { get; set; }

        /// <summary>Apellido del empleado</summary>
        public string? apellido { get; set; }

        /// <summary>Email de contacto (opcional)</summary>
        public string? email { get; set; }

        /// <summary>Teléfono de contacto (opcional)</summary>
        public string? telefono { get; set; }

        // ─── Control de acceso ──────────────────────────────────────────────────
        /// <summary>
        /// Fecha de expiración. NULL = solo revocable manualmente.
        /// </summary>
        public DateTimeOffset? fecha_expiracion { get; set; }

        /// <summary>El owner puede desactivar el acceso en cualquier momento.</summary>
        public bool activo { get; set; } = true;

        // ─── Auditoría de uso ───────────────────────────────────────────────────
        /// <summary>Momento del primer uso del código.</summary>
        public DateTimeOffset? fecha_uso { get; set; }

        /// <summary>Contador de autenticaciones con este código.</summary>
        public int usos { get; set; } = 0;

        public DateTimeOffset fecha_alta { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? fecha_modif { get; set; }

        // Navegación
        public virtual ef_cuentas? ef_cuentas { get; set; }
        public virtual ef_eventos? ef_eventos { get; set; }
        public virtual ef_roles? ef_roles { get; set; }
    }
}
