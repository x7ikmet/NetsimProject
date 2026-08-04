using Microsoft.AspNetCore.Identity;

namespace Netsim.Api.Auth;
public static class UserProvisioning
{
    public static async Task<bool> TryRunAsync(
        WebApplication app,
        string[] args
    )
    {
        if (!args.Contains("--create-user"))
        {
            return false;
        }

        var username = Environment.GetEnvironmentVariable("NETSIM_USERNAME")
            ?? throw new InvalidOperationException("NETSIM_USERNAME is missing.");

        var password = Environment.GetEnvironmentVariable("NETSIM_USER_PASSWORD")
            ?? throw new InvalidOperationException(
                "NETSIM_USER_PASSWORD is missing.");

        await using var scope = app.Services.CreateAsyncScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<IdentityUser>>();
        var result = await userManager.CreateAsync(
            new IdentityUser {UserName = username},
            password
        );

        if (!result.Succeeded)
        {
            throw new InvalidOperationException(
                string.Join(
                    Environment.NewLine,
                    result.Errors.Select(error => error.Description)
                )
            );
        }
        Console.WriteLine($"Created user: {username}");
        return true;
    }
}

