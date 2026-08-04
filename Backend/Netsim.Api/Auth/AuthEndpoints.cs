using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;

namespace Netsim.Api.Auth;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(
        this IEndpointRouteBuilder endpoints
    )
    {
        var auth = endpoints.MapGroup("/auth");

        auth.MapPost("/login", LoginAsync);
        auth.MapPost("/logout", LogoutAsync)
            .RequireAuthorization();
        auth.MapGet("/me", GetCurrentUser)
            .RequireAuthorization();
        
        return endpoints;
    }
    private static async Task<IResult> LoginAsync(
        LoginRequest request,
        SignInManager<IdentityUser> signInManager
    )
    {
        var result = await signInManager.PasswordSignInAsync(
            request.Username,
            request.Password,
            isPersistent: false,
            lockoutOnFailure: true
        );

        return result.Succeeded ? Results.NoContent() : Results.Unauthorized();
    }

    private static async Task<IResult> LogoutAsync(
        SignInManager<IdentityUser> signInManager
    )
    {
        await signInManager.SignOutAsync();
        return Results.NoContent();
    }

    private static IResult GetCurrentUser(HttpContext context)
    {
        return Results.Ok(new
        {
            username = context.User.Identity?.Name
        });
    }

    public sealed record LoginRequest(string Username, string Password);

}

