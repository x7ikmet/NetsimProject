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
    });

builder.Services.AddAuthorization();

var app = builder.Build();

if (await UserProvisioning.TryRunAsync(app, args))
{
    return;
}


app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/", () => "Hello World!");
app.MapAuthEndpoints();

app.Run();
