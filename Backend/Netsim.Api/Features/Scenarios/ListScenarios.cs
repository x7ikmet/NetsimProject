using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Netsim.Api.Infrastructure.Authentication;
using Netsim.Api.Infrastructure.Endpoints;
using Netsim.Api.Infrastructure.Persistence;

namespace Netsim.Api.Features.Scenarios;

public static class ListScenarios
{
    public sealed record Response(
        int ScenarioNo,
        string Name,
        string StockCode,
        string StockName,
        double Quantity,
        string Unit,
        double TotalCost,
        string? Currency,
        int Revision,
        DateTime CreatedAt,
        DateTime UpdatedAt);

    private static async Task<IResult> Handle(
        ClaimsPrincipal user,
        ApplicationDbContext db,
        CancellationToken cancellationToken)
    {
        var userId = user.GetUserId();
        if (userId is null) return Results.Unauthorized();

        var scenarios = await db.Scenarios
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.UpdatedAt)
            .Select(x => new Response(
                x.ScenarioNo,
                x.Name,
                x.StockCode,
                x.StockName,
                x.Quantity,
                x.Unit,
                x.TotalCost,
                x.Currency,
                x.Revision,
                x.CreatedAt,
                x.UpdatedAt))
            .ToListAsync(cancellationToken);

        return Results.Ok(scenarios);
    }

    public sealed class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapGet("/api/scenarios", Handle)
                .RequireAuthorization()
                .WithTags("Scenarios")
                .WithName("ListScenarios");
    }
}
