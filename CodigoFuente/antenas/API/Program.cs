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
using FluentAssertions.Common;
using System.Text;
using DocumentFormat.OpenXml.Office2016.Drawing.ChartDrawing;
using API.Services.UsXRol;
using API.Services.ImportacionMecanizada;
using System.Net.Http;
using Polly;
using Polly.Extensions.Http;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
IdentityModelEventSource.ShowPII = true;

builder.Services.AddControllers().AddNewtonsoftJson(x => x.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore);

// Configuración de autenticación JWT
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

// Configuración de políticas de autorización
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("ApiScope", policy =>
    {
        policy.RequireAuthenticatedUser();
    });
});

// Configuración de la base de datos
builder.Services.AddDbContext<DataContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("PostgreSQL"))
           .EnableSensitiveDataLogging()
           .LogTo(Console.WriteLine, LogLevel.Information));

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
builder.Services.AddHealthChecks();

// Registro de servicios principales
builder.Services.AddScoped(typeof(IImportacionMecanizadaService<>), typeof(ImportacionMecanizadaService<>));
builder.Services.AddScoped<IMovimientosService, MovimientosService>();
builder.Services.AddScoped<ICabeceraLiquidacionService, DocentesHistoricoService>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped(typeof(IProcesarMecanizadaService<>), typeof(ProcesarMecanizadaService<>));
builder.Services.AddScoped<IPOFService, POFService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IUsXRolService, UsXRolService>();
builder.Services.AddScoped(typeof(ICRUDService<>), typeof(BaseCRUDService<>));
builder.Services.AddScoped<IConsolidarMecanizadaService, ConsolidarMecanizadaService>();

// Registro de repositorios
builder.Services.AddScoped(typeof(IRepository<>), typeof(BaseRepository<>));

// Configuración de servicios para Partes Diarios
builder.Services.AddHttpClient<IHistoricoDocentesClient, HistoricoDocentesClient>(client =>
{
    client.BaseAddress = new Uri("https://pd.mardelplata.gob.ar/");
    client.DefaultRequestHeaders.Add("Accept", "application/json");
});

builder.Services.AddSingleton<ITokenService>(new TokenService(
    builder.Configuration["PartesDiarios:SecretKey"]
));

builder.Services.AddScoped<IPartesDiariosService>(provider =>
    new PartesDiariosService(
        provider.GetRequiredService<ITokenService>(),
        provider.GetRequiredService<IHistoricoDocentesClient>(),
        builder.Configuration["PartesDiarios:ApiKey"]
    ));

// Configuración de CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy",
        builder => builder.AllowAnyOrigin()
        .AllowAnyMethod()
        .AllowAnyHeader());
});

// Configuración de IIS
builder.Services.Configure<IISServerOptions>(options =>
{
    options.MaxRequestBodySize = int.MaxValue;
});

// Configuración de Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Construcción de la aplicación
var app = builder.Build();

// Configuración del pipeline de solicitudes HTTP
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

// Definición de la política de reintentos (esto puede quedarse al final ya que es un método auxiliar)
static IAsyncPolicy<HttpResponseMessage> GetRetryPolicy()
{
    return HttpPolicyExtensions
        .HandleTransientHttpError()
        .OrResult(msg => msg.StatusCode == System.Net.HttpStatusCode.NotFound)
        .WaitAndRetryAsync(3, retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)));
}

app.Run();