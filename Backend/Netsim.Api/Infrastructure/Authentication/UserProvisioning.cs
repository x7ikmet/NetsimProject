using Microsoft.AspNetCore.Identity;
using Netsim.Api.Features.ActivityLogs;

namespace Netsim.Api.Infrastructure.Authentication;
public static class UserProvisioning
{
    public static async Task<bool> TryRunAsync(
        WebApplication app,
        string[] args
    )
    {
        var createUser = args.Contains("--create-user");
        var setManager = args.Contains("--set-manager");
        if (!createUser && !setManager)
        {
            return false;
        }

        var username = Environment.GetEnvironmentVariable("NETSIM_USERNAME")
            ?? throw new InvalidOperationException("NETSIM_USERNAME is missing.");

        var role = setManager
            ? ActivityLogAuthorization.ManagerRole
            : Environment.GetEnvironmentVariable("NETSIM_USER_ROLE");
        if (role is not null && role != ActivityLogAuthorization.ManagerRole)
            throw new InvalidOperationException("NETSIM_USER_ROLE can only be Manager.");

        await using var scope = app.Services.CreateAsyncScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<IdentityUser>>();
        IdentityUser user;
        if (setManager)
        {
            user = await userManager.FindByNameAsync(username)
                ?? throw new InvalidOperationException($"User '{username}' was not found.");
        }
        else
        {
            var password = Environment.GetEnvironmentVariable("NETSIM_USER_PASSWORD")
                ?? throw new InvalidOperationException("NETSIM_USER_PASSWORD is missing.");
            user = new IdentityUser { UserName = username };
            var result = await userManager.CreateAsync(user, password);
            if (!result.Succeeded)
                throw new InvalidOperationException(string.Join(
                    Environment.NewLine,
                    result.Errors.Select(error => error.Description)));
        }

        if (role is not null)
        {
            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
            if (!await roleManager.RoleExistsAsync(role))
            {
                var createRoleResult = await roleManager.CreateAsync(new IdentityRole(role));
                if (!createRoleResult.Succeeded)
                    throw new InvalidOperationException(string.Join(
                        Environment.NewLine,
                        createRoleResult.Errors.Select(error => error.Description)));
            }

            if (!await userManager.IsInRoleAsync(user, role))
            {
                var roleResult = await userManager.AddToRoleAsync(user, role);
                if (!roleResult.Succeeded)
                    throw new InvalidOperationException(string.Join(
                        Environment.NewLine,
                        roleResult.Errors.Select(error => error.Description)));
            }
        }

        var activityLogWriter = scope.ServiceProvider.GetRequiredService<ActivityLogWriter>();
        await activityLogWriter.WriteAsync(
            setManager ? ActivityEvents.ManagerRoleGranted : ActivityEvents.UserCreated,
            "SYSTEM",
            description: setManager
                ? $"{username} kullanıcısına Manager rolü verildi."
                : $"{username} kullanıcısı oluşturuldu.",
            data: role is null ? null : new { role });
        Console.WriteLine(setManager
            ? $"Granted Manager role to user: {username}"
            : $"Created user: {username}");
        return true;
    }
}

