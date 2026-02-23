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
using PhoneNumbers;

public static class PhoneUtilHelper
{
    private static readonly PhoneNumberUtil Util = PhoneNumberUtil.GetInstance();


    // regionDefault: "AR" por defecto
    public static string? NormalizeE164(string? raw, string regionDefault = "AR")
    {
        if (string.IsNullOrWhiteSpace(raw)) return null;

        var cleaned = raw.Trim();

        try
        {
            var parsed = Util.Parse(cleaned, regionDefault);

            if (!Util.IsValidNumber(parsed))
                return null;

            return Util.Format(parsed, PhoneNumberFormat.E164); // +549...
        }
        catch
        {
            return null;
        }
    }
}
