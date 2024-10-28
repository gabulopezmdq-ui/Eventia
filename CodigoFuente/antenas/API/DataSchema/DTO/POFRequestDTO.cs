namespace API.DataSchema.DTO
{
    public class POFRequestDTO
    {
        public PersonaRequest Persona { get; set; }  // Cambiado a PersonaRequest
        public int IdEstablecimiento { get; set; }
    }

    public class PersonaRequest
    {
        public string DNI { get; set; }
        public string Legajo { get; set; }
    }
}
