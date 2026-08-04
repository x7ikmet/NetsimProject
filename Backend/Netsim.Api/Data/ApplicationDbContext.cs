using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
namespace Netsim.Api.Data;
public sealed class ApplicationDbContext(
    DbContextOptions<ApplicationDbContext> options)
    : IdentityDbContext(options)
{
    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.Entity<IdentityUser>()
            .Property(x => x.Id).HasMaxLength(64);
        builder.Entity<IdentityRole>()
            .Property(x => x.Id).HasMaxLength(64);
        builder.Entity<IdentityRoleClaim<string>>()
            .Property(x => x.RoleId).HasMaxLength(64);
        builder.Entity<IdentityUserClaim<string>>()
            .Property(x => x.UserId).HasMaxLength(64);
        builder.Entity<IdentityUserLogin<string>>()
            .Property(x => x.UserId).HasMaxLength(64);
        builder.Entity<IdentityUserRole<string>>()
            .Property(x => x.UserId).HasMaxLength(64);
        builder.Entity<IdentityUserRole<string>>()
            .Property(x => x.RoleId).HasMaxLength(64);
        builder.Entity<IdentityUserToken<string>>()
            .Property(x => x.UserId).HasMaxLength(64);
    }
}