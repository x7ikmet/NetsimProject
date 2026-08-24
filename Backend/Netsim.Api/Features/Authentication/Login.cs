using Microsoft.AspNetCore.Identity;
using Netsim.Api.Features.ActivityLogs;
using Netsim.Api.Infrastructure.Authentication;
using Netsim.Api.Infrastructure.Endpoints;
using Netsim.Api.Infrastructure.Http;

namespace Netsim.Api.Features.Authentication;

public static class Login
{
    public sealed record Request(string Username, string Password);

    public static class Validator
    {
        public static string? Validate(Request request) =>
            string.IsNullOrWhiteSpace(request.Username) ||
            string.IsNullOrWhiteSpace(request.Password)
                ? "Username and password are required."
                : null;
    }

    private static async Task<IResult> Handle(
        HttpContext context,
        IWebHostEnvironment environment,
        Request request,
        UserManager<IdentityUser> userManager,
        SignInManager<IdentityUser> signInManager,
        JwtTokenService tokenService,
        ActivityLogWriter activityLogWriter,
        ILogger<Endpoint> logger,
        CancellationToken cancellationToken)
    {
        var error = Validator.Validate(request);
        if (error is not null) return ApiResults.Validation("credentials", error);

        var user = await userManager.FindByNameAsync(request.Username);
        if (user is null)
        {
            await TryWriteFailureAsync(
                activityLogWriter,
                logger,
                request.Username.Trim(),
                null,
                context,
                cancellationToken);
            return Results.Unauthorized();
        }

        var result = await signInManager.CheckPasswordSignInAsync(
            user,
            request.Password,
            lockoutOnFailure: true);
        if (!result.Succeeded)
        {
            await TryWriteFailureAsync(
                activityLogWriter,
                logger,
                user.UserName!,
                user.Id,
                context,
                cancellationToken);
            return Results.Unauthorized();
        }

        var roles = await userManager.GetRolesAsync(user);
        var token = tokenService.Create(user, roles);
        await activityLogWriter.WriteAsync(
            ActivityEvents.LoginSucceeded,
            user.UserName!,
            user.Id,
            token.SessionId,
            "Kullanıcı sisteme giriş yaptı.",
            ip: context.Connection.RemoteIpAddress?.ToString(),
            cancellationToken: cancellationToken);
        context.Response.Cookies.Append(
            JwtTokenService.CookieName,
            token.AccessToken,
            new CookieOptions
            {
                HttpOnly = true,
                Secure = !environment.IsDevelopment(),
                SameSite = SameSiteMode.Strict,
                Expires = new DateTimeOffset(token.ExpiresAtUtc),
                Path = "/",
            });

        return Results.NoContent();
    }

    private static async Task TryWriteFailureAsync(
        ActivityLogWriter writer,
        ILogger logger,
        string username,
        string? userId,
        HttpContext context,
        CancellationToken cancellationToken)
    {
        try
        {
            await writer.WriteAsync(
                ActivityEvents.LoginFailed,
                username,
                userId,
                description: "Başarısız giriş denemesi.",
                ip: context.Connection.RemoteIpAddress?.ToString(),
                cancellationToken: cancellationToken);
        }
        catch (Exception exception)
        {
            logger.LogWarning(exception, "Failed to record a rejected login attempt.");
        }
    }

    public sealed class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapPost("/auth/login", Handle)
                .WithTags("Authentication")
                .WithName("Login");
    }
}
