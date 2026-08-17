using Microsoft.AspNetCore.Antiforgery;
using Netsim.Api.Infrastructure.Http;

namespace Netsim.Api.Infrastructure.Proxy;

public static class ReverseProxyEndpoints
{
    public static void MapN4ReverseProxy(this WebApplication app)
    {
        app.MapReverseProxy(proxyPipeline =>
        {
            proxyPipeline.Use(async (context, next) =>
            {
                var method = context.Request.Method;
                var requiresCsrf =
                    !HttpMethods.IsGet(method) &&
                    !HttpMethods.IsHead(method) &&
                    !HttpMethods.IsOptions(method) &&
                    !HttpMethods.IsTrace(method);

                if (requiresCsrf)
                {
                    var antiforgery = context.RequestServices
                        .GetRequiredService<IAntiforgery>();
                    if (!await antiforgery.IsRequestValidAsync(context))
                    {
                        await ApiResults.BadRequest("Invalid CSRF token.")
                            .ExecuteAsync(context);
                        return;
                    }
                }

                await next();
            });
        }).RequireAuthorization();
    }
}
