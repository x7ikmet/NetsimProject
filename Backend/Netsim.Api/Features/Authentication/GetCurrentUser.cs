using Netsim.Api.Features.ActivityLogs;
using Netsim.Api.Infrastructure.Endpoints;

namespace Netsim.Api.Features.Authentication;

public static class GetCurrentUser
{
    public sealed record Response(string? Username, bool CanViewActivityLogs);

    private static IResult Handle(HttpContext context) =>
        Results.Ok(new Response(
            context.User.Identity?.Name,
            context.User.IsInRole(ActivityLogAuthorization.ManagerRole)));

    public sealed class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapGet("/auth/me", Handle)
                .RequireAuthorization()
                .WithTags("Authentication")
                .WithName("GetCurrentUser");
    }
}
