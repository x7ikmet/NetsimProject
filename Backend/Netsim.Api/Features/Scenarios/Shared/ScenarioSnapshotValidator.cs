using System.Text;
using System.Text.Json;

namespace Netsim.Api.Features.Scenarios.Shared;

internal static class ScenarioSnapshotValidator
{
    private const int MaxSnapshotBytes = 5 * 1024 * 1024;

    public static string? Validate(JsonElement snapshot, out string snapshotJson)
    {
        snapshotJson = "";
        if (snapshot.ValueKind != JsonValueKind.Object ||
            !snapshot.TryGetProperty("schemaVersion", out var version) ||
            !version.TryGetInt32(out var schemaVersion) || schemaVersion != 1 ||
            !snapshot.TryGetProperty("tree", out var tree) ||
            tree.ValueKind != JsonValueKind.Array || tree.GetArrayLength() == 0)
        {
            return "Snapshot schema is invalid.";
        }

        snapshotJson = snapshot.GetRawText();
        return Encoding.UTF8.GetByteCount(snapshotJson) <= MaxSnapshotBytes
            ? null
            : "Snapshot must not exceed 5 MB.";
    }
}
