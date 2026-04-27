using API.DataSchema.Interfaz;
using System;

namespace API.DataSchema
{
    public class ef_invitados_perfiles : IRegistroUnico
    {
        public long id_invitado { get; set; }
        public DateTime? fecha_nacimiento { get; set; }
        public short? edad_anios { get; set; }
        public string? instagram { get; set; }
        public string? zona { get; set; }
        public string? ciudad { get; set; }
        public long? id_perfil_asistencia { get; set; }
        public bool acepta_terminos { get; set; }
        public bool acepta_comunicaciones { get; set; }
        public bool acepta_promociones { get; set; }
        public string? origen_registro { get; set; }
        public string? campania_fuente { get; set; }
        public string? campania_medio { get; set; }
        public string? campania_nombre { get; set; }
        public string? campania_contenido { get; set; }
        public string? campania_termino { get; set; }
        public string? pagina_origen { get; set; }
        public string? referer { get; set; }
        public DateTimeOffset fecha_alta { get; set; }
        public DateTimeOffset? fecha_modif { get; set; }

        public string[] UniqueProperties => Array.Empty<string>();

        public virtual ef_invitados? invitado { get; set; }
        public virtual ef_param_perfiles_asistencia? perfil_asistencia { get; set; }
    }
}