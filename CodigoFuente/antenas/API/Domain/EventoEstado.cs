using System;

namespace API.Domain
{
    public static class EventoEstado
    {
        public const string Borrador = "B";        // Armando evento
        public const string PendientePago = "P";   // Plan pago elegido, falta pago
        public const string Activo = "A";          // Pago aprobado / evento operativo
        public const string Cancelado = "C";       // (opcional)
    }

}
