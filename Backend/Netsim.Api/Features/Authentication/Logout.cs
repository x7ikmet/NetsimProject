using Netsim.Api.Features.ActivityLogs;
using Netsim.Api.Infrastructure.Authentication;
using Netsim.Api.Infrastructure.Endpoints;
using Netsim.Api.Infrastructure.Http;

namespace Netsim.Api.Features.Authentication;

public static class Logout
{
    private static async Task<IResult> Handle(
        HttpContext context,
        ActivityLogWriter activityLogWriter,
        ILogger<Endpoint> logger,
        CancellationToken cancellationToken)
    {
        try
        {
            await activityLogWriter.WriteAsync(
                ActivityEvents.Logout,
                context.User.Identity!.Name!,
                context.User.GetUserId(),
                context.User.GetSessionId(),
                "Kullanıcı sistemden çıkış yaptı.",
                ip: context.Connection.RemoteIpAddress?.ToString(),
                cancellationToken: cancellationToken);
        }
        catch (Exception exception)
        {
            logger.LogWarning(exception, "Failed to record logout.");
        }

        context.Response.Cookies.Delete(
            JwtTokenService.CookieName,
            new CookieOptions { Path = "/" });
        return Results.NoContent();
    }

    public sealed class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapPost("/auth/logout", Handle)
                .RequireAuthorization()
                .RequireCsrf()
                .WithTags("Authentication")
                .WithName("Logout");
    }
}
