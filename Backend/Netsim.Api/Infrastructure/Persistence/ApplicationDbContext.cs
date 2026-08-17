using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Netsim.Api.Features.Scenarios.Shared;
using Netsim.Api.Infrastructure.Persistence.Configurations;

namespace Netsim.Api.Infrastructure.Persistence;

public sealed class ApplicationDbContext(
    DbContextOptions<ApplicationDbContext> options)
    : IdentityDbContext(options)
{
    public const int IdentityKeyLength = 64;

    public DbSet<Scenario> Scenarios => Set<Scenario>();

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

        builder.ApplyConfiguration(new ScenarioConfiguration());
    }
}
