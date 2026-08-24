using System.Text.Json;
using Netsim.Api.Infrastructure.Persistence;

namespace Netsim.Api.Features.ActivityLogs;

public sealed record ActivityEvent(
    string Code,
    string Class,
    string Operation,
    string Module,
    string? SourceTable = null);

public static class ActivityEvents
{
    public static readonly ActivityEvent LoginSucceeded =
        new("GRS_BASARILI", "I", "Başarılı giriş", "KIMLIK");
    public static readonly ActivityEvent LoginFailed =
        new("GRS_BASARISIZ", "E", "Başarısız giriş", "KIMLIK");
    public static readonly ActivityEvent Logout =
        new("CIKIS", "I", "Çıkış", "KIMLIK");
    public static readonly ActivityEvent UserCreated =
        new("KULLANICI_EKLE", "I", "Kullanıcı oluşturma", "KIMLIK", "AspNetUsers");
    public static readonly ActivityEvent ManagerRoleGranted =
        new("YONETICI_YETKI", "I", "Yönetici yetkisi verme", "KIMLIK", "AspNetUserRoles");

    private static readonly Dictionary<string, ActivityEvent> ClientEvents = new()
    {
        ["MLYT_HESAPLA"] = new("MLYT_HESAPLA", "L", "Maliyet hesaplama", "URUN AGACI"),
        ["VARYANT_DEGISTIR"] = new("VARYANT_DEGISTIR", "L", "Varyant değiştirme", "URUN AGACI"),
        ["BILESEN_EKLE"] = new("BILESEN_EKLE", "L", "Bileşen ekleme", "URUN AGACI"),
        ["BILESEN_DEGISTIR"] = new("BILESEN_DEGISTIR", "L", "Bileşen değiştirme", "URUN AGACI"),
        ["BILESEN_SIL"] = new("BILESEN_SIL", "L", "Bileşen silme", "URUN AGACI"),
        ["PDF_AKTAR"] = new("PDF_AKTAR", "I", "PDF aktarma", "URUN AGACI"),
        ["EXCEL_AKTAR"] = new("EXCEL_AKTAR", "I", "Excel aktarma", "URUN AGACI"),
    };

    public static bool TryGetClientEvent(string code, out ActivityEvent activityEvent) =>
        ClientEvents.TryGetValue(code, out activityEvent!);
}

public sealed class ActivityLogWriter(ApplicationDbContext db)
{
    public async Task WriteAsync(
        ActivityEvent activityEvent,
        string username,
        string? userId = null,
        string? sessionCode = null,
        string? description = null,
        int? sourceNumber = null,
        int? sourceDetailNumber = null,
        object? data = null,
        string? ip = null,
        CancellationToken cancellationToken = default)
    {
        var now = DateTime.Now;
        db.ActivityLogs.Add(new CostActivityLog
        {
            UserId = userId,
            Username = username,
            SessionCode = sessionCode,
            LogCode = activityEvent.Code,
            LogClass = activityEvent.Class,
            Date = now,
            Operation = activityEvent.Operation,
            Description = description,
            SourceModule = activityEvent.Module,
            SourceTable = activityEvent.SourceTable,
            SourceNumber = sourceNumber,
            SourceDetailNumber = sourceDetailNumber,
            DataJson = data is null ? null : JsonSerializer.Serialize(data),
            Ip = ip,
            CreatedAt = now,
            Guid = System.Guid.NewGuid().ToString(),
        });
        await db.SaveChangesAsync(cancellationToken);
    }
}
