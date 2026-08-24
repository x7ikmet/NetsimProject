using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Netsim.Api.Infrastructure.Endpoints;
using Netsim.Api.Infrastructure.Persistence;

namespace Netsim.Api.Features.ActivityLogs;

public static class GetActivityLogs
{
    public sealed class Request
    {
        public int Page { get; init; } = 1;
        public int PageSize { get; init; } = 25;
        public string? Username { get; init; }
        public string? EventCode { get; init; }
        public DateTime? From { get; init; }
        public DateTime? To { get; init; }
    }

    public sealed record Item(
        int CostLogNo,
        string Username,
        string LogCode,
        string LogClass,
        DateTime Date,
        string Operation,
        string? Description,
        string SourceModule,
        int? SourceNumber,
        int? SourceDetailNumber,
        JsonElement? Data,
        string? Ip);

    public sealed record Response(IReadOnlyList<Item> Items, int Page, int PageSize, int Total);

    private static async Task<IResult> Handle(
        [AsParameters] Request request,
        ApplicationDbContext db,
        CancellationToken cancellationToken)
    {
        var page = Math.Max(request.Page, 1);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);
        var query = db.ActivityLogs.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(request.Username))
            query = query.Where(x => x.Username.Contains(request.Username));
        if (!string.IsNullOrWhiteSpace(request.EventCode))
            query = query.Where(x => x.LogCode == request.EventCode);
        if (request.From is not null)
            query = query.Where(x => x.Date >= request.From);
        if (request.To is not null)
            query = query.Where(x => x.Date <= request.To);

        var total = await query.CountAsync(cancellationToken);
        var rows = await query
            .OrderByDescending(x => x.Date)
            .ThenByDescending(x => x.CostLogNo)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var items = rows.Select(x => new Item(
            x.CostLogNo,
            x.Username,
            x.LogCode,
            x.LogClass,
            x.Date,
            x.Operation,
            x.Description,
            x.SourceModule,
            x.SourceNumber,
            x.SourceDetailNumber,
            ParseJson(x.DataJson),
            x.Ip)).ToList();

        return Results.Ok(new Response(items, page, pageSize, total));
    }

    private static JsonElement? ParseJson(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : JsonSerializer.Deserialize<JsonElement>(value);

    public sealed class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapGet("/api/activity-logs", Handle)
                .RequireAuthorization(ActivityLogAuthorization.ManagerPolicy)
                .WithTags("Activity Logs")
                .WithName("GetActivityLogs");
    }
}
