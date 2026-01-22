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
}
