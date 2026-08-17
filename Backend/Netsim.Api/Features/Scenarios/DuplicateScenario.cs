using System.Security.Claims;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Netsim.Api.Infrastructure.Authentication;
using Netsim.Api.Features.Scenarios.Shared;
using Netsim.Api.Infrastructure.Endpoints;
using Netsim.Api.Infrastructure.Http;
using Netsim.Api.Infrastructure.Persistence;

namespace Netsim.Api.Features.Scenarios;

public static class DuplicateScenario
{
    public sealed record Request(string? Name);

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
        public static string? Validate(Request request) =>
            !string.IsNullOrWhiteSpace(request.Name) && request.Name.Trim().Length > 80
                ? "Name must not exceed 80 characters."
                : null;
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

        var error = Validator.Validate(request);
        if (error is not null) return ApiResults.Validation("name", error);

        var source = await db.Scenarios
            .AsNoTracking()
            .SingleOrDefaultAsync(
                x => x.ScenarioNo == scenarioNo && x.UserId == userId,
                cancellationToken);
        if (source is null)
            return ApiResults.NotFound("Scenario was not found.");

        var duplicate = new Scenario
        {
            UserId = userId,
            Name = string.IsNullOrWhiteSpace(request.Name)
                ? $"{source.Name[..Math.Min(source.Name.Length, 72)]} (Kopya)"
                : request.Name.Trim(),
            StockNo = source.StockNo,
            StockCode = source.StockCode,
            StockName = source.StockName,
            StockVariantNo = source.StockVariantNo,
            VariantCode = source.VariantCode,
            VariantName = source.VariantName,
            Quantity = source.Quantity,
            Unit = source.Unit,
            CostMethod = source.CostMethod,
            TotalCost = source.TotalCost,
            Currency = source.Currency,
            SnapshotJson = source.SnapshotJson,
        };

        db.Scenarios.Add(duplicate);
        await db.SaveChangesAsync(cancellationToken);
        await db.Entry(duplicate).ReloadAsync(cancellationToken);

        return Results.Created(
            $"/api/scenarios/{duplicate.ScenarioNo}",
            ToResponse(duplicate));
    }

    public sealed class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapPost("/api/scenarios/{scenarioNo:int}/duplicate", Handle)
                .RequireAuthorization()
                .RequireCsrf()
                .WithTags("Scenarios")
                .WithName("DuplicateScenario");
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
}
