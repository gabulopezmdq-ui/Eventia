namespace API.DataSchema
{
    /// <summary>
    /// Relación N-N entre ef_staff y ef_cuenta_unidades.
    /// Un empleado puede estar asignado a múltiples unidades dentro de la cuenta.
    /// </summary>
    public class ef_staff_unidades
    {
        public long id_staff { get; set; }
        public long id_unidad { get; set; }

        // Navegación
        public virtual ef_staff? ef_staff { get; set; }
        public virtual ef_cuenta_unidades? ef_cuenta_unidades { get; set; }
    }
}
