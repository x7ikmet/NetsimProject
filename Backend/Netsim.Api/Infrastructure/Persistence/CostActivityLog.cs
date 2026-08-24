using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Netsim.Api.Infrastructure.Persistence;

public sealed class CostActivityLog
{
    public int CostLogNo { get; set; }
    public string? UserId { get; set; }
    public required string Username { get; set; }
    public string? SessionCode { get; set; }
    public required string LogCode { get; set; }
    public required string LogClass { get; set; }
    public DateTime Date { get; set; }
    public required string Operation { get; set; }
    public string? Description { get; set; }
    public required string SourceModule { get; set; }
    public string? SourceTable { get; set; }
    public int? SourceNumber { get; set; }
    public int? SourceDetailNumber { get; set; }
    public string? DataJson { get; set; }
    public string? Ip { get; set; }
    public DateTime CreatedAt { get; set; }
    public required string Guid { get; set; }
    public string System { get; set; } = "H";
}

public sealed class CostActivityLogConfiguration : IEntityTypeConfiguration<CostActivityLog>
{
    public void Configure(EntityTypeBuilder<CostActivityLog> entity)
    {
        entity.ToTable("NS_MLYTLOGS");
        entity.HasKey(x => x.CostLogNo).HasName("MLYTLOGS$PRI");
        entity.Property(x => x.CostLogNo).HasColumnName("MALIYET_LOG_NO").ValueGeneratedOnAdd();
        entity.Property(x => x.UserId).HasColumnName("KULLANICI_ID").HasMaxLength(64);
        entity.Property(x => x.Username).HasColumnName("KULLANICI_ADI").HasMaxLength(256);
        entity.Property(x => x.SessionCode).HasColumnName("OTURUM_KODU").HasMaxLength(48);
        entity.Property(x => x.LogCode).HasColumnName("LOG_KODU").HasMaxLength(24);
        entity.Property(x => x.LogClass).HasColumnName("LOG_SINIFI").HasColumnType("CHAR(1)");
        entity.Property(x => x.Date).HasColumnName("TARIH").HasDefaultValueSql("LOCALTIMESTAMP");
        entity.Property(x => x.Operation).HasColumnName("ISLEM").HasMaxLength(80);
        entity.Property(x => x.Description).HasColumnName("ACIKLAMA").HasMaxLength(1024);
        entity.Property(x => x.SourceModule).HasColumnName("KAYNAK_MODUL").HasMaxLength(24);
        entity.Property(x => x.SourceTable).HasColumnName("KAYNAK_TABLO").HasMaxLength(80);
        entity.Property(x => x.SourceNumber).HasColumnName("KAYNAK_ISLEM_NO");
        entity.Property(x => x.SourceDetailNumber).HasColumnName("KAYNAK_ISLEM_DETAY_NO");
        entity.Property(x => x.DataJson).HasColumnName("VERI").HasColumnType("BLOB SUB_TYPE TEXT CHARACTER SET UTF8");
        entity.Property(x => x.Ip).HasColumnName("IP").HasMaxLength(80);
        entity.Property(x => x.CreatedAt).HasColumnName("CTIMESTAMP").HasDefaultValueSql("LOCALTIMESTAMP");
        entity.Property(x => x.Guid).HasColumnName("RGUID").HasMaxLength(48);
        entity.Property(x => x.System).HasColumnName("SYSTEM").HasColumnType("CHAR(1)").HasDefaultValue("H");
        entity.HasIndex(x => x.Username).HasDatabaseName("MLYTLOGS$KULLANICI_NDX");
        entity.HasIndex(x => x.Date).HasDatabaseName("MLYTLOGS$TARIH_NDX");
        entity.HasIndex(x => new { x.SourceNumber, x.SourceDetailNumber }).HasDatabaseName("MLYTLOGS$KAYNAK_NDX");
    }
}
