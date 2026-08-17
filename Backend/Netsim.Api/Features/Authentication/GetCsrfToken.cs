using Microsoft.AspNetCore.Antiforgery;
using Netsim.Api.Infrastructure.Endpoints;

namespace Netsim.Api.Features.Authentication;

public static class GetCsrfToken
{
    public sealed record Response(string? Token);

    private static IResult Handle(HttpContext context, IAntiforgery antiforgery)
    {
        var tokens = antiforgery.GetAndStoreTokens(context);
        return Results.Ok(new Response(tokens.RequestToken));
    }

    public sealed class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapGet("/auth/csrf", Handle)
                .RequireAuthorization()
                .WithTags("Authentication")
                .WithName("GetCsrfToken");
    }
}
