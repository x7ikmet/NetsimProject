using System.Text.Json;
using Netsim.Api.Infrastructure.Authentication;
using Netsim.Api.Infrastructure.Endpoints;
using Netsim.Api.Infrastructure.Http;

namespace Netsim.Api.Features.ActivityLogs;

public static class CreateActivityLog
{
    public sealed record Request(
        string EventCode,
        int StockNo,
        int? StockVariantNo,
        string? StockCode,
        string? VariantCode,
        JsonElement? OldValue,
        JsonElement? NewValue);

    public static class Validator
    {
        public static string? Validate(Request request)
        {
            if (!ActivityEvents.TryGetClientEvent(request.EventCode, out _))
                return "Unknown activity event.";
            if (request.StockNo <= 0)
                return "Stock number must be greater than zero.";
            if (request.StockCode?.Length > 24 || request.VariantCode?.Length > 24)
                return "Stock and variant codes can contain at most 24 characters.";
            if (request.OldValue is null && request.NewValue is null)
                return "At least one activity value is required.";
            return null;
        }
    }

    private static async Task<IResult> Handle(
        HttpContext context,
        Request request,
        ActivityLogWriter writer,
        CancellationToken cancellationToken)
    {
        var error = Validator.Validate(request);
        if (error is not null) return ApiResults.Validation("activity", error);

        ActivityEvents.TryGetClientEvent(request.EventCode, out var activityEvent);
        var data = new
        {
            schemaVersion = 1,
            stockCode = request.StockCode,
            variantCode = request.VariantCode,
            oldValue = request.OldValue,
            newValue = request.NewValue,
        };
        var serialized = JsonSerializer.Serialize(data);
        if (serialized.Length > 32_768)
            return ApiResults.Validation("activity", "Activity data is too large.");

        await writer.WriteAsync(
            activityEvent,
            context.User.Identity!.Name!,
            context.User.GetUserId(),
            context.User.GetSessionId(),
            BuildDescription(activityEvent.Code, request.StockCode),
            request.StockNo,
            request.StockVariantNo,
            data,
            context.Connection.RemoteIpAddress?.ToString(),
            cancellationToken);

        return Results.NoContent();
    }

    private static string BuildDescription(string eventCode, string? stockCode) =>
        eventCode switch
        {
            "MLYT_HESAPLA" => $"{stockCode ?? "Stok"} için maliyet hesaplandı.",
            "VARYANT_DEGISTIR" => $"{stockCode ?? "Stok"} varyantı değiştirildi.",
            "BILESEN_EKLE" => $"{stockCode ?? "Stok"} bileşeni eklendi.",
            "BILESEN_DEGISTIR" => $"{stockCode ?? "Stok"} bileşeni değiştirildi.",
            "BILESEN_SIL" => $"{stockCode ?? "Stok"} bileşeni silindi.",
            "PDF_AKTAR" => $"{stockCode ?? "Stok"} maliyet ağacı PDF olarak aktarıldı.",
            "EXCEL_AKTAR" => $"{stockCode ?? "Stok"} maliyet ağacı Excel olarak aktarıldı.",
            _ => "Kullanıcı işlemi kaydedildi.",
        };

    public sealed class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapPost("/api/activity-logs", Handle)
                .RequireAuthorization()
                .RequireCsrf()
                .WithTags("Activity Logs")
                .WithName("CreateActivityLog");
    }
}
