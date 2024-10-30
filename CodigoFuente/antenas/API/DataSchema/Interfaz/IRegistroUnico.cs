namespace API.DataSchema.Interfaz
{
    public interface IRegistroUnico
    {
        // Define aquí las propiedades que se consideran únicas
        string[] UniqueProperties { get; }
    }
}