using System;

namespace API.Domain
{
    public static class EventoEstado
    {
        public const string Borrador = "B";        // Armando / configuración
        public const string PendientePago = "P";   // Pago pendiente
        public const string Activo = "A";          // Operativo / publicado
        public const string Cerrado = "C";         // Finalizado / Cerrado
        public const string Anulado = "X";         // Cancelado / creado por error
    }

}
