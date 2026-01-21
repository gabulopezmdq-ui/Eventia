using API.DataSchema;
using API.Repositories;
using API.Services;
using API.Utility;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Logging;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;
using System;
using API;
using System.IO;
using FluentAssertions.Common;
using System.Text;
using DocumentFormat.OpenXml.Office2016.Drawing.ChartDrawing;
//using API.Services.UsXRol;
//using API.Services.ImportacionMecanizada;
using System.Net.Http;
using Polly;
using Polly.Extensions.Http;



var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args,
    ContentRootPath = Directory.GetCurrentDirectory()
});

// Reconfigurar configuration SIN FileSystemWatcher
builder.Configuration.Sources.Clear();

builder.Configuration
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: false)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: false)
    .AddEnvironmentVariables();



// Add services to the container.
IdentityModelEventSource.ShowPII = true;

builder.Services.AddControllers().AddNewtonsoftJson(x => x.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore);

// Configuraci�n de autenticaci�n JWT
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => {
        options.MapInboundClaims = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration.GetValue<string>("Ldap:Dominio"),
            ValidAudience = builder.Configuration.GetValue<string>("Ldap:Dominio"),
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration.GetValue<string>("Ldap:Key"))),
            ClockSkew = TimeSpan.Zero
        };
    });

// Configuraci�n de pol�ticas de autorizaci�n
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("ApiScope", policy =>
    {
        policy.RequireAuthenticatedUser();
    });
});

//builder.Services.AddIdentityCore<IdentityUser>()
//    .AddEntityFrameworkStores<AppDbContext>();

// Configuraci�n de la base de datos
builder.Services.AddDbContext<DataContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Supabase"))
           .EnableSensitiveDataLogging()
           .LogTo(Console.WriteLine, LogLevel.Information));

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
builder.Services.AddHealthChecks();

// Registro de servicios principales
//builder.Services.AddScoped<IMovimientosService, MovimientosService>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped(typeof(ICRUDService<>), typeof(BaseCRUDService<>));

// Registro de repositorios
builder.Services.AddScoped(typeof(IRepository<>), typeof(BaseRepository<>));


// Configuraci�n de CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy",
        builder => builder.AllowAnyOrigin()
        .AllowAnyMethod()
        .AllowAnyHeader());
});

builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(int.Parse(
        Environment.GetEnvironmentVariable("PORT") ?? "8080"));
});

// Configuraci�n de IIS
builder.Services.Configure<IISServerOptions>(options =>
{
    options.MaxRequestBodySize = int.MaxValue;
});

// Configuraci�n de Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Construcci�n de la aplicaci�n
var app = builder.Build();

// Configuraci�n del pipeline de solicitudes HTTP
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<GlobalErrorHandlingMiddleware>();

app.UseCors("CorsPolicy");
app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapControllers().RequireAuthorization("ApiScope");
app.Map("/health", app => app.UseHealthChecks("/health"));

// Definici�n de la pol�tica de reintentos (esto puede quedarse al final ya que es un m�todo auxiliar)
static IAsyncPolicy<HttpResponseMessage> GetRetryPolicy()
{
    return HttpPolicyExtensions
        .HandleTransientHttpError()
        .OrResult(msg => msg.StatusCode == System.Net.HttpStatusCode.NotFound)
        .WaitAndRetryAsync(3, retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)));
}

app.Run();