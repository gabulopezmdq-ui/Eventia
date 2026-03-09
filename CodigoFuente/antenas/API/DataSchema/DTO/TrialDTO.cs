using System;

namespace API.DataSchema.DTO
{
    public class TrialDTO
    {
        public int dias_restantes { get; set; }
        public bool vencido { get; set; }
        public DateTimeOffset? current_period_end { get; set; }
    }
}
