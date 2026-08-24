using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Netsim.Api.Infrastructure.Persistence;

public sealed class ApplicationDbContext(
    DbContextOptions<ApplicationDbContext> options)
    : IdentityDbContext(options)
{
    public const int IdentityKeyLength = 64;
    public DbSet<CostActivityLog> ActivityLogs => Set<CostActivityLog>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<IdentityUser>()
            .Property(x => x.Id).HasMaxLength(IdentityKeyLength);
        builder.Entity<IdentityRole>()
            .Property(x => x.Id).HasMaxLength(IdentityKeyLength);
        builder.Entity<IdentityRoleClaim<string>>()
            .Property(x => x.RoleId).HasMaxLength(IdentityKeyLength);
        builder.Entity<IdentityUserClaim<string>>()
            .Property(x => x.UserId).HasMaxLength(IdentityKeyLength);
        builder.Entity<IdentityUserLogin<string>>()
            .Property(x => x.UserId).HasMaxLength(IdentityKeyLength);
        builder.Entity<IdentityUserRole<string>>()
            .Property(x => x.UserId).HasMaxLength(IdentityKeyLength);
        builder.Entity<IdentityUserRole<string>>()
            .Property(x => x.RoleId).HasMaxLength(IdentityKeyLength);
        builder.Entity<IdentityUserToken<string>>()
            .Property(x => x.UserId).HasMaxLength(IdentityKeyLength);

        builder.HasSequence<int>("MALIYET_LOG_NO");
        builder.ApplyConfiguration(new CostActivityLogConfiguration());
    }
}
