using Microsoft.AspNetCore.Identity;

namespace Netsim.Api.Auth;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(
        this IEndpointRouteBuilder endpoints
    )
    {
        var auth = endpoints.MapGroup("/auth");

        auth.MapPost("/login", LoginAsync);
        auth.MapGet("/me", GetCurrentUser)
            .RequireAuthorization();
        auth.MapPost("/logout", LogoutAsync);
        
        return endpoints;
    }
    private static async Task<IResult> LoginAsync(
        HttpContext context,
        IWebHostEnvironment environment,
        LoginRequest request,
        UserManager<IdentityUser> userManager,
        SignInManager<IdentityUser> signInManager,
        JwtTokenService tokenService
    )
    {
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
        {
            return Results.BadRequest(new
            {
                error = "Username and password are required."
            });
        }

        var user = await userManager.FindByNameAsync(request.Username);
        if(user is null)
        {
            return Results.Unauthorized();
        }

        var result = await signInManager.CheckPasswordSignInAsync(
            user,
            request.Password,
            lockoutOnFailure: true
        );

        if (!result.Succeeded)
        {
            return Results.Unauthorized();
        }

        var token = tokenService.Create(user);

        context.Response.Cookies.Append(
            JwtTokenService.CookieName,
            token.AccessToken,
            new CookieOptions
            {
                HttpOnly = true,
                Secure = !environment.IsDevelopment(),
                SameSite = SameSiteMode.Strict,
                Expires = new DateTimeOffset(token.ExpiresAtUtc),
                Path = "/"
            });

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

    private static IResult LogoutAsync(HttpContext context)
    {
        context.Response.Cookies.Delete(
            JwtTokenService.CookieName,
            new CookieOptions
            {
                Path = "/"
            }
        );
        return Results.NoContent();
    }
}



