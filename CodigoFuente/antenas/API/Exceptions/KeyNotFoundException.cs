using System;

namespace rsFoodtrucks.Exceptions
{
    public class KeyNotFoundException : Exception
    {
        public KeyNotFoundException(string message) : base(message)
        { }
    }
}
