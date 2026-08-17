using System.Text.Json;
using Netsim.Api.Features.Scenarios;
using Xunit;

namespace Netsim.Api.Tests.Features.Scenarios;

public sealed class CreateScenarioTests
{
    [Fact]
    public void Validator_AcceptsValidRequest()
    {
        var request = CreateRequest("""{"schemaVersion":1,"tree":[{"stockNo":42}]}""");

        var error = CreateScenario.Validator.Validate(request, out var snapshotJson);

        Assert.Null(error);
        Assert.NotEmpty(snapshotJson);
    }

    [Fact]
    public void Validator_RejectsEmptyBomTree()
    {
        var request = CreateRequest("""{"schemaVersion":1,"tree":[]}""");

        var error = CreateScenario.Validator.Validate(request, out _);

        Assert.Equal("Snapshot schema is invalid.", error);
    }

    internal static CreateScenario.Request CreateRequest(string snapshotJson) => new()
    {
        Name = "Eğitim Senaryosu",
        StockNo = 42,
        StockCode = "STK-42",
        StockName = "Test Stok",
        Quantity = 1,
        Unit = "ADET",
        CostMethod = "ORTALAMA",
        TotalCost = 100,
        Snapshot = JsonDocument.Parse(snapshotJson).RootElement.Clone(),
    };
}
