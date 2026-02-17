namespace API.DataSchema.DTO
{
    public class ConvertirSolicitudPlantillaRequestDTO
    {
        // codigo de la nueva plantilla (obligatorio)
        public string codigo { get; set; }

        // opcional: notas del admin
        public string observaciones_admin { get; set; }

        // activar o no la plantilla creada
        public bool activo { get; set; } = true;
    }
}
