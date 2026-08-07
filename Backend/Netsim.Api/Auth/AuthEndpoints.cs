using Microsoft.AspNetCore.Antiforgery;
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
        auth.MapGet("/csrf", GetCsrfToken)
            .RequireAuthorization();
        
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

    private static async Task<IResult> LogoutAsync(
        HttpContext context,
        IAntiforgery antiforgery)
    {
        if(context.User.Identity?.IsAuthenticated == true &&
            !await antiforgery.IsRequestValidAsync(context))
        {
            return Results.BadRequest();
        }
        context.Response.Cookies.Delete(
            JwtTokenService.CookieName,
            new CookieOptions
            {
                Path = "/"
            }
        );
        return Results.NoContent();
    }

    private static IResult GetCsrfToken(
        HttpContext context,
        IAntiforgery antiforgery)
    {
        var tokens = antiforgery.GetAndStoreTokens(context);

        return Results.Ok(new
        {
            token = tokens.RequestToken
        });
    }
}



