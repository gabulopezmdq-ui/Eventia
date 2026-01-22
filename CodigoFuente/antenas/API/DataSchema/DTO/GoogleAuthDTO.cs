using System;

namespace API.DataSchema.DTO
{
    public class GoogleAuthDTO
    {
    }
    public class auth_google_request
    {
        public string id_token { get; set; } = null!;
    }

    public class auth_login_response
    {
        public string access_token { get; set; } = null!;
        public DateTimeOffset expires_at_utc { get; set; }
    }

    public class auth_register_request
    {
        public string email { get; set; } = null!;
        public string password { get; set; } = null!;
        public string nombre { get; set; } = null!;
        public string apellido { get; set; } = null!;
    }

    public class auth_login_request
    {
        public string email { get; set; } = null!;
        public string password { get; set; } = null!;
    }

}
