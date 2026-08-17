using Microsoft.AspNetCore.Identity;

namespace Netsim.Api.Features.Scenarios.Shared;

public sealed class Scenario
{
    public int ScenarioNo { get; set; }
    public string UserId { get; set; } = "";
    public string Name { get; set; } = "";
    public int StockNo { get; set; }
    public string StockCode { get; set; } = "";
    public string StockName { get; set; } = "";
    public int? StockVariantNo { get; set; }
    public string? VariantCode { get; set; }
    public string? VariantName { get; set; }
    public double Quantity { get; set; }
    public string Unit { get; set; } = "";
    public string CostMethod { get; set; } = "";
    public double TotalCost { get; set; }
    public string? Currency { get; set; }
    public string SnapshotJson { get; set; } = "";
    public int Revision { get; set; } = 1;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public IdentityUser User { get; set; } = null!;
}
