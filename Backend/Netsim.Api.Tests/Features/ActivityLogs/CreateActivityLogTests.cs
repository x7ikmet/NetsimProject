using System.Net;
using Netsim.Api.Features.ActivityLogs;
using Xunit;

namespace Netsim.Api.Tests.Features.ActivityLogs;

public sealed class CreateActivityLogTests
{
    [Fact]
    public void Validator_AcceptsKnownEventAndRejectsUnknownEvent()
    {
        var valid = new CreateActivityLog.Request(
            "MLYT_HESAPLA", 42, null, "STK-42", null, null,
            System.Text.Json.JsonSerializer.SerializeToElement(new { totalCost = 10 }));
        var invalid = valid with { EventCode = "UNSUPPORTED" };

        Assert.Null(CreateActivityLog.Validator.Validate(valid));
        Assert.Equal("Unknown activity event.", CreateActivityLog.Validator.Validate(invalid));
    }
}

public sealed class ActivityLogEndpointTests(ApiWebApplicationFactory factory)
    : IClassFixture<ApiWebApplicationFactory>
{
    [Fact]
    public async Task ListEndpoint_RequiresAuthentication()
    {
        using var client = factory.CreateClient();
        var response = await client.GetAsync("/api/activity-logs");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
