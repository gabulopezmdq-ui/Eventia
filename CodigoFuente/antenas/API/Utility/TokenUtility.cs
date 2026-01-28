using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using rsFoodtrucks.Exceptions;
//using rsFoodtrucks.Models;
using System;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using KeyNotFoundException = rsFoodtrucks.Exceptions.KeyNotFoundException;
using NotImplementedException = rsFoodtrucks.Exceptions.NotImplementedException;
using UnauthorizedAccessException = rsFoodtrucks.Exceptions.UnauthorizedAccessException;
using System.Security.Cryptography;

namespace API.Utility
{
    public static class TokenUtility
    {
        public static string Generate(int length)
        {
            var bytes = RandomNumberGenerator.GetBytes(length);

            return Convert.ToBase64String(bytes)
                .Replace("+", "")
                .Replace("/", "")
                .Replace("=", "")
                .Substring(0, length);
        }
    }
}
