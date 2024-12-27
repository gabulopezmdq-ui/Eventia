using  API.DataSchema;
using  API.Repositories;
using  API.Services;
using  API.Utility;
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

var builder = WebApplication.CreateBuilder(args);
// Add services to the container.
IdentityModelEventSource.ShowPII = true;
/*
builder.WebHost.UseKestrel(opt =>
{
   opt.ListenAnyIP(5000);
   opt.ListenAnyIP(5001, listOpt =>
    {
        listOpt.UseHttps(builder.Configuration["CertPath"], builder.Configuration["CertPassword"]);
    });
});
*/
/*
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });
*/


builder.Services.AddControllers().AddNewtonsoftJson(x => x.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore);

//builder.Services.AddControllers();
//builder.Services.AddControllers();

//builder.Services.AddControllersWithViews(o => o.SslPort = 5001);
/*
builder.Services.AddControllers().AddJsonOptions(option =>
{
    option.JsonSerializerOptions.DefaultIgnoreCondition =
    JsonIgnoreCondition.WhenWritingNull;
}); */
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
             options.TokenValidationParameters = new TokenValidationParameters
             {
                ValidateIssuer = true,
                 ValidateAudience = true,
                 ValidateLifetime = true,
                 ValidateIssuerSigningKey = true,
                 ValidIssuer = builder.Configuration.GetValue<string>("Ldap:Dominio"),
                 ValidAudience = builder.Configuration.GetValue<string>("Ldap:Dominio"),
                 IssuerSigningKey = new SymmetricSecurityKey(
                //Encoding.UTF8.GetBytes("_configuration[\"Llave_super_secreta\"]")),
                Encoding.UTF8.GetBytes(builder.Configuration.GetValue<string>("Ldap:Key"))),//definida por nosotros patron al azar
                 ClockSkew = TimeSpan.Zero
        });

// adds an authorization policy to make sure the token is for scope 'api1'
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("ApiScope", policy =>
    {
        policy.RequireAuthenticatedUser();
        //policy.RequireClaim("scope", "posts-api");
    });
});

builder.Services.AddDbContext<DataContext>(options => options.UseNpgsql(builder.Configuration.GetConnectionString("PostgreSQL")).EnableSensitiveDataLogging().LogTo(Console.WriteLine, LogLevel.Information));
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
//builder.Services.AddDbContext<DataContext>(options => options.UseNpgsql(builder.Configuration.GetConnectionString("PostgreSQL")));
builder.Services.AddHealthChecks();


//Services

builder.Services.AddScoped(typeof(IImportacionMecanizadaService<>), typeof(ImportacionMecanizadaService<>));
builder.Services.AddScoped<ICabeceraLiquidacionService, CabeceraLiquidacionService>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped(typeof(IProcesarMecanizadaService<>), typeof(ProcesarMecanizadaService<>));
builder.Services.AddScoped<IPOFService, POFService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IUsXRolService, UsXRolService>();
builder.Services.AddScoped(typeof(ICRUDService<>), typeof(BaseCRUDService<>));

//Repositories

builder.Services.AddScoped(typeof(IRepository<>), typeof(BaseRepository<>));
//builder.Services.AddScoped<IRepository<EV_Conservadora>, EV_ConservadoraRepository>();


builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy",
        builder => builder.AllowAnyOrigin()
        .AllowAnyMethod()
        .AllowAnyHeader());
});
builder.Services.Configure<IISServerOptions>(options =>
{
    options.MaxRequestBodySize = int.MaxValue;
});
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware(typeof(GlobalErrorHandlingMiddleware));

app.UseCors("CorsPolicy");
app.UseAuthentication();
app.UseRouting();

app.MapControllers();
app.MapControllers().RequireAuthorization("ApiScope");
app.Map("/health", app => app.UseHealthChecks("/health"));

app.UseAuthorization();
// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
//app.UseHttpsRedirection();

app.Run();
