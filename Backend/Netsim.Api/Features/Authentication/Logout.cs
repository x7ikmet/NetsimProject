using Netsim.Api.Infrastructure.Authentication;
using Netsim.Api.Infrastructure.Endpoints;
using Netsim.Api.Infrastructure.Http;

namespace Netsim.Api.Features.Authentication;

public static class Logout
{
    private static IResult Handle(HttpContext context)
    {
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
