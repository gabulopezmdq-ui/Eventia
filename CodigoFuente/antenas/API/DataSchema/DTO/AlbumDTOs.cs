using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;

namespace API.DataSchema.DTO
{
    public class AlbumUploadDTO
    {
        public IFormFile archivo { get; set; } = null!;
        public string? nombre_invitado { get; set; }
        public string? mensaje { get; set; }
        public long? id_tramo { get; set; }
        public string origen { get; set; } = "INVITADO"; // INVITADO | FOTOCABINA
    }

    public class AlbumFeedFilterDTO
    {
        public int page { get; set; } = 1;
        public int pageSize { get; set; } = 20;
        public long? id_tramo { get; set; }
        public string? estado { get; set; } // PENDIENTE | APROBADA | RECHAZADA
        public bool? es_destacada { get; set; }
    }

    public class AlbumModeracionDTO
    {
        public long id_foto { get; set; }
        public string estado { get; set; } = null!; // APROBADA | RECHAZADA
        public bool? es_destacada { get; set; }
    }

    public class AlbumConfigUpdateDTO
    {
        public bool moderacion_obligatoria { get; set; }
        public bool permitir_nombre_invitado { get; set; }
        public bool permitir_mensaje { get; set; }
        public bool permitir_likes { get; set; }
        public bool permitir_descarga { get; set; }
        public string live_modo { get; set; } = "TODAS";
        public bool fotocabina_activa { get; set; }
        public long? fotocabina_overlay_default_id { get; set; }
    }

    public class AlbumLikeDTO
    {
        public long id_foto { get; set; }
        public string device_id { get; set; } = null!;
        public long? id_invitado { get; set; }
    }
}
