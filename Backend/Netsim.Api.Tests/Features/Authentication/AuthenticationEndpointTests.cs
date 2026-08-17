using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace Netsim.Api.Tests.Features.Authentication;

public sealed class AuthenticationEndpointTests(ApiWebApplicationFactory factory)
    : IClassFixture<ApiWebApplicationFactory>
{
    [Fact]
    public async Task CurrentUserEndpoint_RequiresAuthentication()
    {
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/auth/me");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task LoginEndpoint_RejectsMissingCredentials()
    {
        using var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync(
            "/auth/login",
            new { Username = "", Password = "" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    }
}
