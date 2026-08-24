using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Netsim.Api.Features.ActivityLogs;
using Netsim.Api.Infrastructure.Authentication;
using Netsim.Api.Infrastructure.Persistence;
using Yarp.ReverseProxy.Configuration;

namespace Netsim.Api.Infrastructure;

public static class DependencyInjection
{
    public const string ClientCorsPolicy = "Client";

    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString =
            configuration.GetConnectionString("IdentityDatabase")
            ?? throw new InvalidOperationException(
                "Connection string 'IdentityDatabase' was not found.");

        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseFirebird(connectionString));
        services
            .AddIdentityCore<IdentityUser>(options =>
                options.Stores.MaxLengthForKeys = ApplicationDbContext.IdentityKeyLength)
            .AddRoles<IdentityRole>()
            .AddEntityFrameworkStores<ApplicationDbContext>()
            .AddSignInManager();
        services.AddScoped<ActivityLogWriter>();

        var jwtOptions = JwtOptions.FromConfiguration(configuration);
        services.AddSingleton(jwtOptions);
        services.AddSingleton<JwtTokenService>();
        services
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
                    NameClaimType = JwtRegisteredClaimNames.UniqueName,
                    RoleClaimType = ClaimTypes.Role,
                };
                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        context.Token = context.Request.Cookies[JwtTokenService.CookieName];
                        return Task.CompletedTask;
                    },
                };
            });
        services.AddAuthorization(options =>
            options.AddPolicy(
                ActivityLogAuthorization.ManagerPolicy,
                policy => policy.RequireRole(ActivityLogAuthorization.ManagerRole)));

        var clientOrigin = configuration["CLIENT_ORIGIN"]
            ?? throw new InvalidOperationException("CLIENT_ORIGIN is missing.");
        services.AddCors(options =>
        {
            options.AddPolicy(ClientCorsPolicy, policy =>
                policy
                    .WithOrigins(clientOrigin)
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials());
        });

        services.AddAntiforgery(options => options.HeaderName = "X-CSRF-TOKEN");
        services.AddProblemDetails();
        AddN4Proxy(services, configuration);

        return services;
    }

    private static void AddN4Proxy(
        IServiceCollection services,
        IConfiguration configuration)
    {
        var n4BaseUrl = configuration["N4_BASE_URL"]
            ?? throw new InvalidOperationException("N4_BASE_URL is missing.");

        services
            .AddReverseProxy()
            .LoadFromMemory(
                [new RouteConfig
                {
                    RouteId = "n4-crud",
                    ClusterId = "n4",
                    Match = new RouteMatch { Path = "/crud/{**remaining}" },
                }],
                [new ClusterConfig
                {
                    ClusterId = "n4",
                    Destinations = new Dictionary<string, DestinationConfig>
                    {
                        ["primary"] = new() { Address = n4BaseUrl },
                    },
                }]);
    }
}
