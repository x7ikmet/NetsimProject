using System.Security.Claims;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Netsim.Api.Infrastructure.Authentication;
using Netsim.Api.Features.Scenarios.Shared;
using Netsim.Api.Infrastructure.Endpoints;
using Netsim.Api.Infrastructure.Http;
using Netsim.Api.Infrastructure.Persistence;

namespace Netsim.Api.Features.Scenarios;

public static class UpdateScenario
{
    public sealed class Request
    {
        public string Name { get; init; } = "";
        public int StockNo { get; init; }
        public string StockCode { get; init; } = "";
        public string StockName { get; init; } = "";
        public int? StockVariantNo { get; init; }
        public string? VariantCode { get; init; }
        public string? VariantName { get; init; }
        public double Quantity { get; init; }
        public string Unit { get; init; } = "";
        public string CostMethod { get; init; } = "";
        public double TotalCost { get; init; }
        public string? Currency { get; init; }
        public int Revision { get; init; }
        public JsonElement Snapshot { get; init; }
    }

    public sealed record Response(
        int ScenarioNo,
        string Name,
        int StockNo,
        string StockCode,
        string StockName,
        int? StockVariantNo,
        string? VariantCode,
        string? VariantName,
        double Quantity,
        string Unit,
        string CostMethod,
        double TotalCost,
        string? Currency,
        int Revision,
        DateTime CreatedAt,
        DateTime UpdatedAt,
        JsonElement Snapshot);

    public static class Validator
    {
        public static string? Validate(Request request, out string snapshotJson)
        {
            snapshotJson = "";
            if (request.Revision < 1) return "Revision is required.";
            if (!Fits(request.Name, 80))
                return "Name must contain 1 to 80 characters.";
            if (request.StockNo <= 0) return "Stock number is invalid.";
            if (!Fits(request.StockCode, 24) || !Fits(request.StockName, 140))
                return "Stock information is invalid.";
            if (!FitsOptional(request.VariantCode, 24) ||
                !FitsOptional(request.VariantName, 80))
                return "Variant information is invalid.";
            if (!double.IsFinite(request.Quantity) || request.Quantity <= 0)
                return "Quantity must be greater than zero.";
            if (!Fits(request.Unit, 10) || !Fits(request.CostMethod, 24))
                return "Unit or cost method is invalid.";
            if (!double.IsFinite(request.TotalCost) || request.TotalCost < 0)
                return "Total cost is invalid.";
            if (!FitsOptional(request.Currency, 4)) return "Currency is invalid.";

            return ScenarioSnapshotValidator.Validate(request.Snapshot, out snapshotJson);
        }
    }

    private static async Task<IResult> Handle(
        int scenarioNo,
        Request request,
        ClaimsPrincipal user,
        ApplicationDbContext db,
        CancellationToken cancellationToken)
    {
        var userId = user.GetUserId();
        if (userId is null) return Results.Unauthorized();

        var error = Validator.Validate(request, out var snapshotJson);
        if (error is not null) return ApiResults.Validation("request", error);

        var scenario = await db.Scenarios.SingleOrDefaultAsync(
            x => x.ScenarioNo == scenarioNo && x.UserId == userId,
            cancellationToken);
        if (scenario is null)
            return ApiResults.NotFound("Scenario was not found.");
        if (scenario.Revision != request.Revision)
            return ApiResults.Conflict("Scenario was updated elsewhere.");

        Apply(request, snapshotJson, scenario);
        try
        {
            await db.SaveChangesAsync(cancellationToken);
            await db.Entry(scenario).ReloadAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            return ApiResults.Conflict("Scenario was updated elsewhere.");
        }

        return Results.Ok(ToResponse(scenario));
    }

    public sealed class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapPut("/api/scenarios/{scenarioNo:int}", Handle)
                .RequireAuthorization()
                .RequireCsrf()
                .WithTags("Scenarios")
                .WithName("UpdateScenario");
    }

    private static void Apply(Request request, string snapshotJson, Scenario scenario)
    {
        scenario.Name = request.Name.Trim();
        scenario.StockNo = request.StockNo;
        scenario.StockCode = request.StockCode.Trim();
        scenario.StockName = request.StockName.Trim();
        scenario.StockVariantNo = request.StockVariantNo;
        scenario.VariantCode = NullIfEmpty(request.VariantCode);
        scenario.VariantName = NullIfEmpty(request.VariantName);
        scenario.Quantity = request.Quantity;
        scenario.Unit = request.Unit.Trim();
        scenario.CostMethod = request.CostMethod.Trim();
        scenario.TotalCost = request.TotalCost;
        scenario.Currency = NullIfEmpty(request.Currency);
        scenario.SnapshotJson = snapshotJson;
    }

    private static Response ToResponse(Scenario scenario) => new(
        scenario.ScenarioNo,
        scenario.Name,
        scenario.StockNo,
        scenario.StockCode,
        scenario.StockName,
        scenario.StockVariantNo,
        scenario.VariantCode,
        scenario.VariantName,
        scenario.Quantity,
        scenario.Unit,
        scenario.CostMethod,
        scenario.TotalCost,
        scenario.Currency,
        scenario.Revision,
        scenario.CreatedAt,
        scenario.UpdatedAt,
        JsonSerializer.Deserialize<JsonElement>(scenario.SnapshotJson));

    private static bool Fits(string? value, int maxLength) =>
        !string.IsNullOrWhiteSpace(value) && value.Trim().Length <= maxLength;

    private static bool FitsOptional(string? value, int maxLength) =>
        string.IsNullOrWhiteSpace(value) || value.Trim().Length <= maxLength;

    private static string? NullIfEmpty(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
