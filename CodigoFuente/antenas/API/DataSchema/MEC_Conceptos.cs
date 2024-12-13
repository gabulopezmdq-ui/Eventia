using API.DataSchema.Interfaz;

namespace API.DataSchema
{
    public class MEC_Conceptos : IRegistroUnico
    {
        public int IdConcepto { get; set; }
        public string CodConcepto { get; set; }
        public string? CodConceptoMgp { get; set; }
        public string Descripcion { get; set; }
        public string ConAporte { get; set; }
        public string Patronal { get; set; }
        public string Vigente { get; set; }
        public string? DevolucionSalario { get; set; }
        public string[] UniqueProperties => new[] { "CodConcepto", "CodConceptoMgp" }; //  CodCategoria es unico
    }
}
