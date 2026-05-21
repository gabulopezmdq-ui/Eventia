using API;
using API.DataSchema;
using API.Repositories;
using API.Services;
using API.Services.Cuentas;
using API.Services.Eventos;
using API.Services.Planes;
using API.Services.Precios;
using API.Services.Regalos;
using API.Services.Roles;
using API.Services.Staff;
using API.Utility;
using DocumentFormat.OpenXml.Office2016.Drawing.ChartDrawing;
using FluentAssertions.Common;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Logging;
using Microsoft.IdentityModel.Tokens;
using Polly;
using Polly.Extensions.Http;
using QuestPDF.Infrastructure;
using System;
using System.IO;
//using API.Services.UsXRol;
//using API.Services.ImportacionMecanizada;
using System.Net.Http;
using System.Security.Claims;
using System.Text;

var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args,
    ContentRootPath = Directory.GetCurrentDirectory()
});

QuestPDF.Settings.License = LicenseType.Community;
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);


// Reconfigurar configuration SIN FileSystemWatcher
builder.Configuration.Sources.Clear();

builder.Configuration
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: false)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: false)
    .AddEnvironmentVariables();



// Add services to the container.
IdentityModelEventSource.ShowPII = true;

//builder.Services.AddControllers().AddNewtonsoftJson(x => x.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore);

// Configuraci�n de autenticaci�n JWT
//builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
//    .AddJwtBearer(options => {
//        options.MapInboundClaims = false;
//        options.TokenValidationParameters = new TokenValidationParameters
//        {
//            ValidateIssuer = true,
//            ValidateAudience = true,
//            ValidateLifetime = true,
//            ValidateIssuerSigningKey = true,
//            ValidIssuer = builder.Configuration.GetValue<string>("Ldap:Dominio"),
//            ValidAudience = builder.Configuration.GetValue<string>("Ldap:Dominio"),
//            IssuerSigningKey = new SymmetricSecurityKey(
//                Encoding.UTF8.GetBytes(builder.Configuration.GetValue<string>("Ldap:Key"))),
//            ClockSkew = TimeSpan.Zero
//        };
//    });

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],

            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audience"],

            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)
            ),

            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(2),

            //lo agrego porque me dijo chatgpt despues de cambiar generar_jwt_async a async
            RoleClaimType = ClaimTypes.Role
        };
    }); 

builder.Services.AddAuthorization();

// Configuraci�n de pol�ticas de autorizaci�n
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("ApiScope", policy =>
    {
        policy.RequireAuthenticatedUser();
    });
});

builder.Services.AddControllers()
    .AddNewtonsoftJson(x => x.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore);


//builder.Services.AddIdentityCore<IdentityUser>()
//    .AddEntityFrameworkStores<AppDbContext>();

// Configuraci�n de la base de datos
builder.Services.AddDbContext<DataContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Supabase"))
           .EnableSensitiveDataLogging()
           .LogTo(Console.WriteLine, LogLevel.Information));

builder.Services.AddHealthChecks();

// Registro de servicios principales
//builder.Services.AddScoped<IMovimientosService, MovimientosService>();
builder.Services.AddScoped<loginService>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IEventosService, EventosService>();
builder.Services.AddScoped<IInvitacionService, InvitacionService>();
builder.Services.AddScoped<IParametricaService, ParametricaService>();
builder.Services.AddScoped(typeof(ICRUDService<>), typeof(BaseCRUDService<>));
builder.Services.AddScoped<IEventoPlantillasService, EventoPlantillasService>();
builder.Services.AddScoped<IAutorizacionesService, AutorizacionesService>();
builder.Services.AddScoped<IQrService, QrService>();
builder.Services.AddScoped<IPorteroService, PorteroService>();
builder.Services.AddScoped<IAlimentacionService, AlimentacionService>();
builder.Services.AddScoped<IRestriccionesService, RestriccionesService>();
builder.Services.AddScoped<ICuentaContextService, CuentaContextService>();
builder.Services.AddScoped<ICuentasService, CuentasService>();
builder.Services.AddScoped<ICuentaUsuariosService, CuentaUsuariosService>();
builder.Services.AddScoped<AuthContextService>();
builder.Services.AddScoped<IAdminCuentasService, AdminCuentasService>();
builder.Services.AddScoped<ICuentaContextService, CuentaContextService>();
builder.Services.AddScoped<IMesasService, MesasService>();

builder.Services.AddScoped<IEventoHospedajesService, EventoHospedajesService>();
builder.Services.AddScoped<IHospedajeTagsService, HospedajeTagsService>();

builder.Services.AddScoped<ICuentaHospedajePlantillasService, CuentaHospedajePlantillasService>();

builder.Services.AddScoped<IEventoCaptacionLinksService, EventoCaptacionLinksService>();
builder.Services.AddScoped<IAudienciasService, AudienciasService>();

builder.Services.AddScoped<IRolesService, RolesService>();


// Módulo Álbum
builder.Services.AddScoped<IStorageService, StorageService>();
builder.Services.AddScoped<IFeatureGuardService, FeatureGuardService>();
builder.Services.AddScoped<IAlbumService, AlbumService>();
builder.Services.AddScoped<IFotocabinaService, FotocabinaService>();
builder.Services.AddScoped<IRankingService, RankingService>();

builder.Services.AddScoped<IEventoCaptacionLinksService, EventoCaptacionLinksService>();

// Módulo Staff
builder.Services.AddScoped<IStaffService, StaffService>();
builder.Services.AddScoped<IProgramasService, ProgramasService>();


//planes-precios
builder.Services.AddScoped<IPreciosService, PreciosService>();
builder.Services.AddScoped<IEventoPlanCambiosService, EventoPlanCambiosService>();
builder.Services.AddScoped<IAdminEventoPlanCambiosService, AdminEventoPlanCambiosService>();

//regalos
builder.Services.AddScoped<IRegalosListaService, RegalosListaService>();
builder.Services.AddScoped<IRegalosFondoService, RegalosFondoService>();
builder.Services.AddScoped<IRegalosTransferenciasService, RegalosTransferenciasService>();
builder.Services.AddScoped<IRegalosPublicBundleService, RegalosPublicBundleService>();
builder.Services.AddScoped<IRegalosTransferenciasConfigService, RegalosTransferenciasConfigService>();

// Registro de repositorios
builder.Services.AddScoped(typeof(IRepository<>), typeof(BaseRepository<>));


// Configuraci�n de CORS
// Configuración de CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy",
        builder => builder
        .WithOrigins("http://localhost:3000", "http://localhost:3005", "https://eventiaapp.vercel.app") 
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials());
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

var endpointDataSource = app.Services.GetRequiredService<EndpointDataSource>();
Console.WriteLine("==== Endpoints registrados ====");
foreach (var endpoint in endpointDataSource.Endpoints)
{
    Console.WriteLine(endpoint.DisplayName);
}
Console.WriteLine("==== Fin de Endpoints ====");


app.UseMiddleware<GlobalErrorHandlingMiddleware>();

app.UseStaticFiles();
app.UseCors("CorsPolicy");
app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
//app.MapControllers().RequireAuthorization("ApiScope");
app.MapGet("/ping", () => "pong");
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