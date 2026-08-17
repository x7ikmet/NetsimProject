using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Netsim.Api.Infrastructure.Authentication;
using Netsim.Api.Infrastructure.Endpoints;
using Netsim.Api.Infrastructure.Http;
using Netsim.Api.Infrastructure.Persistence;

namespace Netsim.Api.Features.Scenarios;

public static class DeleteScenario
{
    private static async Task<IResult> Handle(
        int scenarioNo,
        ClaimsPrincipal user,
        ApplicationDbContext db,
        CancellationToken cancellationToken)
    {
        var userId = user.GetUserId();
        if (userId is null) return Results.Unauthorized();

        var scenario = await db.Scenarios.SingleOrDefaultAsync(
            x => x.ScenarioNo == scenarioNo && x.UserId == userId,
            cancellationToken);
        if (scenario is null)
            return ApiResults.NotFound("Scenario was not found.");

        db.Scenarios.Remove(scenario);
        await db.SaveChangesAsync(cancellationToken);
        return Results.NoContent();
    }

    public sealed class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapDelete("/api/scenarios/{scenarioNo:int}", Handle)
                .RequireAuthorization()
                .RequireCsrf()
                .WithTags("Scenarios")
                .WithName("DeleteScenario");
    }
}
