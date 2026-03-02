using System;
using System.Collections.Generic;

namespace API.DataSchema.DTO
{





    public class RestriccionCatalogItemDTO
    {
        public long IdRestriccion { get; set; }
        public string Codigo { get; set; } = null!;
        public string Nombre { get; set; } = null!;
        public string? Descripcion { get; set; }
        public string? Categoria { get; set; }          // si la tenés
        public string? IconKey { get; set; }            // si la tenés
        public bool Activo { get; set; }
        public int Orden { get; set; }
    }

    public class IntegranteRestriccionDTO
    {
        public long IdRestriccion { get; set; }
        public string? Severidad { get; set; }          // "L" / "M" / "G" (opcional)
        public string? Observaciones { get; set; }
    }

    public class IntegranteRestriccionesUpsertDTO
    {
        public long IdRsvpGrupoIntegrante { get; set; }            // id_invitado del niño/adulto
        public List<IntegranteRestriccionDTO> Restricciones { get; set; } = new();
    }

    public class RestriccionesGrupoUpsertDTO
    {
        // Lista de integrantes que el responsable está editando.
        // Puede mandar solo niños, o niños + él mismo.
        public List<IntegranteRestriccionesUpsertDTO> Integrantes { get; set; } = new();
    }

    public class RestriccionesGrupoResponseDTO
    {
        public long IdEvento { get; set; }
        public long IdGrupo { get; set; }
        public List<IntegranteRestriccionesUpsertDTO> Integrantes { get; set; } = new();
    }

    public class NinoAlimentacionUpdateDTO
    {
        public List<long> IdsRestricciones { get; set; } = new();
        public string? Detalle { get; set; }
    }

    public class RestriccionAlimDTO
    {
        public long IdRestriccionAlim { get; set; }
        public string Codigo { get; set; }
        public string Nombre { get; set; }
    }

    public class NinoAlertaStaffDTO
    {
        public long IdInvitadoNino { get; set; }

        public string Nombre { get; set; }
        public string Apellido { get; set; }

        public string ResponsableNombre { get; set; }
        public string ResponsableApellido { get; set; }
        public string ResponsableCelular { get; set; }

        public List<RestriccionAlimDTO> Restricciones { get; set; } = new();

        public string? Detalle { get; set; }
    }
}
