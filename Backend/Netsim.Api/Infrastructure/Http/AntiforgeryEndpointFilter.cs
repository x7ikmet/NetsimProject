using Microsoft.AspNetCore.Antiforgery;

namespace Netsim.Api.Infrastructure.Http;

public sealed class AntiforgeryEndpointFilter(IAntiforgery antiforgery)
    : IEndpointFilter
{
    public async ValueTask<object?> InvokeAsync(
        EndpointFilterInvocationContext context,
        EndpointFilterDelegate next)
    {
        if (!await antiforgery.IsRequestValidAsync(context.HttpContext))
        {
            return ApiResults.BadRequest("Invalid CSRF token.");
        }

        return await next(context);
    }
}

public static class AntiforgeryEndpointExtensions
{
    public static RouteHandlerBuilder RequireCsrf(this RouteHandlerBuilder endpoint) =>
        endpoint.AddEndpointFilter<AntiforgeryEndpointFilter>();
}
