namespace API.DataSchema.DTO
{
    public class AplicarPlantillaRequestDTO
    {
        public short id_plantilla { get; set; }
        public bool borrar_existente { get; set; } = true;
    }
}
