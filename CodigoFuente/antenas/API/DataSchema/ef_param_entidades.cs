namespace API.DataSchema
{
    public class ef_param_entidades
    {
        public string entidad { get; set; } = null!;          // PK
        public string descripcion { get; set; } = null!;
        public string grupo_menu { get; set; } = "Evento";
        public short orden_menu { get; set; } = 1;

        public bool requiere_traducciones { get; set; } = true;
        public bool requiere_es_ar { get; set; } = true;
        public bool requiere_todos_idiomas { get; set; } = false;
        public bool usa_orden { get; set; } = true;

        public string fallback_locale { get; set; } = "es-AR";
        public short max_len_texto { get; set; } = 120;

        public string? ayuda_ui { get; set; }
        public bool editable_por_superadmin { get; set; } = true;
        public bool activo { get; set; } = true;
    }
}