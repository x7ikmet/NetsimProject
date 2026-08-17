using Netsim.Api.Infrastructure.Endpoints;

namespace Netsim.Api.Features.Authentication;

public static class GetCurrentUser
{
    public sealed record Response(string? Username);

    private static IResult Handle(HttpContext context) =>
        Results.Ok(new Response(context.User.Identity?.Name));

    public sealed class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapGet("/auth/me", Handle)
                .RequireAuthorization()
                .WithTags("Authentication")
                .WithName("GetCurrentUser");
    }
}
