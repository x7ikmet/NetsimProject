using System.Security.Claims;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Netsim.Api.Infrastructure.Authentication;
using Netsim.Api.Infrastructure.Endpoints;
using Netsim.Api.Infrastructure.Http;
using Netsim.Api.Infrastructure.Persistence;

namespace Netsim.Api.Features.Scenarios;

public static class GetScenarioById
{
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

    private static async Task<IResult> Handle(
        int scenarioNo,
        ClaimsPrincipal user,
        ApplicationDbContext db,
        CancellationToken cancellationToken)
    {
        var userId = user.GetUserId();
        if (userId is null) return Results.Unauthorized();

        var scenario = await db.Scenarios
            .AsNoTracking()
            .SingleOrDefaultAsync(
                x => x.ScenarioNo == scenarioNo && x.UserId == userId,
                cancellationToken);
        if (scenario is null)
            return ApiResults.NotFound("Scenario was not found.");

        return Results.Ok(new Response(
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
            JsonSerializer.Deserialize<JsonElement>(scenario.SnapshotJson)));
    }

    public sealed class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapGet("/api/scenarios/{scenarioNo:int}", Handle)
                .RequireAuthorization()
                .WithTags("Scenarios")
                .WithName("GetScenarioById");
    }
}
