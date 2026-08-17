using System.Text.Json;
using Netsim.Api.Features.Scenarios;
using Xunit;

namespace Netsim.Api.Tests.Features.Scenarios;

public sealed class UpdateScenarioTests
{
    [Fact]
    public void Validator_RequiresRevision()
    {
        var request = new UpdateScenario.Request
        {
            Name = "Eğitim Senaryosu",
            StockNo = 42,
            StockCode = "STK-42",
            StockName = "Test Stok",
            Quantity = 1,
            Unit = "ADET",
            CostMethod = "ORTALAMA",
            TotalCost = 100,
            Snapshot = JsonDocument.Parse(
                """{"schemaVersion":1,"tree":[{}]}""").RootElement.Clone(),
        };

        var error = UpdateScenario.Validator.Validate(request, out _);

        Assert.Equal("Revision is required.", error);
    }
}
