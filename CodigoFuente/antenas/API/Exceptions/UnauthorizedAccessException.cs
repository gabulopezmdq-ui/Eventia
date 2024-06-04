using System;

namespace rsFoodtrucks.Exceptions
{
    public class UnauthorizedAccessException : Exception
    {
        public UnauthorizedAccessException(string message) : base(message)
        { }
    }
}
