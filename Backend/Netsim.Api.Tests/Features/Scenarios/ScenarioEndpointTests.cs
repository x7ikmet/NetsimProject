using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace Netsim.Api.Tests.Features.Scenarios;

public sealed class ScenarioEndpointTests(ApiWebApplicationFactory factory)
    : IClassFixture<ApiWebApplicationFactory>
{
    [Theory]
    [InlineData("GET", "/api/scenarios")]
    [InlineData("GET", "/api/scenarios/1")]
    [InlineData("DELETE", "/api/scenarios/1")]
    public async Task Endpoint_RequiresAuthentication(string method, string path)
    {
        using var client = factory.CreateClient();
        using var request = new HttpRequestMessage(new HttpMethod(method), path);

        var response = await client.SendAsync(request);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task CreateEndpoint_RequiresAuthentication()
    {
        using var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/scenarios", new { });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
