using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Netsim.Api.Features.Scenarios.Shared;

namespace Netsim.Api.Infrastructure.Persistence.Configurations;

public sealed class ScenarioConfiguration : IEntityTypeConfiguration<Scenario>
{
    public void Configure(EntityTypeBuilder<Scenario> entity)
    {
        entity.ToTable("NS_SENARYO");
        entity.HasKey(x => x.ScenarioNo).HasName("SENARYO$PRI");

        entity.Property(x => x.ScenarioNo)
            .HasColumnName("SENARYO_NO")
            .ValueGeneratedOnAdd();
        entity.Property(x => x.UserId)
            .HasColumnName("KULLANICI_ID")
            .HasMaxLength(ApplicationDbContext.IdentityKeyLength);
        entity.Property(x => x.Name)
            .HasColumnName("SENARYO_ADI")
            .HasMaxLength(80);
        entity.Property(x => x.StockNo).HasColumnName("STOK_NO");
        entity.Property(x => x.StockCode)
            .HasColumnName("STOK_KODU")
            .HasMaxLength(24);
        entity.Property(x => x.StockName)
            .HasColumnName("STOK_ADI")
            .HasMaxLength(140);
        entity.Property(x => x.StockVariantNo).HasColumnName("STOK_VARYANT_NO");
        entity.Property(x => x.VariantCode)
            .HasColumnName("VARYANT_KODU")
            .HasMaxLength(24);
        entity.Property(x => x.VariantName)
            .HasColumnName("VARYANT_ADI")
            .HasMaxLength(80);
        entity.Property(x => x.Quantity)
            .HasColumnName("MIKTAR")
            .HasColumnType("DOUBLE PRECISION");
        entity.Property(x => x.Unit)
            .HasColumnName("BIRIM")
            .HasMaxLength(10);
        entity.Property(x => x.CostMethod)
            .HasColumnName("MALIYET_YONTEMI")
            .HasMaxLength(24);
        entity.Property(x => x.TotalCost)
            .HasColumnName("TOPLAM_MALIYET")
            .HasColumnType("DOUBLE PRECISION");
        entity.Property(x => x.Currency)
            .HasColumnName("DOVIZ_BIRIMI")
            .HasMaxLength(4);
        entity.Property(x => x.SnapshotJson)
            .HasColumnName("SENARYO_VERISI")
            .HasColumnType("BLOB SUB_TYPE TEXT CHARACTER SET UTF8");
        entity.Property(x => x.Revision)
            .HasColumnName("REVIZYON")
            .HasDefaultValue(1)
            .IsConcurrencyToken();
        entity.Property(x => x.CreatedAt)
            .HasColumnName("CTIMESTAMP")
            .HasDefaultValueSql("LOCALTIMESTAMP")
            .ValueGeneratedOnAdd();
        entity.Property(x => x.UpdatedAt)
            .HasColumnName("RTIMESTAMP")
            .HasDefaultValueSql("LOCALTIMESTAMP");

        entity.HasIndex(x => new { x.UserId, x.UpdatedAt })
            .HasDatabaseName("SENARYO$KULLANICI_NDX");
        entity.HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .HasConstraintName("SENARYO$KULLANICI_FK")
            .OnDelete(DeleteBehavior.Cascade);
    }
}
