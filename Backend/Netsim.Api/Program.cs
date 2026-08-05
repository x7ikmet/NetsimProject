using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Netsim.Api.Data;
using Netsim.Api.Auth;

DotNetEnv.Env.Load();

var builder = WebApplication.CreateBuilder(args);

var connectionString =
    builder.Configuration.GetConnectionString("IdentityDatabase")
    ?? throw new InvalidOperationException(
        "Connection string 'IdentityDatabase' was not found.");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseFirebird(connectionString));
builder.Services
    .AddIdentityCore<IdentityUser>(options =>
        options.Stores.MaxLengthForKeys =
            ApplicationDbContext.IdentityKeyLength)
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddSignInManager();

var jwtOptions = JwtOptions.FromConfiguration(builder.Configuration);

  builder.Services.AddSingleton(jwtOptions);
  builder.Services.AddSingleton<JwtTokenService>();

  builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.MapInboundClaims = false;

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtOptions.Issuer,

            ValidateAudience = true,
            ValidAudience = jwtOptions.Audience,

            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(jwtOptions.Key),

            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30),

            NameClaimType = JwtRegisteredClaimNames.UniqueName
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                context.Token = context.Request.Cookies[JwtTokenService.CookieName];

                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

var clientOrigin =
    builder.Configuration["CLIENT_ORIGIN"]
    ?? throw new InvalidOperationException("CLIENT_ORIGIN is missing.");
builder.Services.AddCors(options =>
{
    options.AddPolicy("Client", policy =>
    {
        policy
            .WithOrigins(clientOrigin)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddAntiforgery(options =>
{
   options.HeaderName = "X-CSRF-TOKEN"; 
});


var app = builder.Build();

if (await UserProvisioning.TryRunAsync(app, args))
{
    return;
}


app.UseCors("Client");
app.UseAuthentication();
app.UseAuthorization();
app.UseAntiforgery();

app.MapAuthEndpoints();

app.Run();
