using Microsoft.AspNetCore.Identity;
using Netsim.Api.Infrastructure.Authentication;
using Netsim.Api.Infrastructure.Endpoints;
using Netsim.Api.Infrastructure.Http;

namespace Netsim.Api.Features.Authentication;

public static class Login
{
    public sealed record Request(string Username, string Password);

    public static class Validator
    {
        public static string? Validate(Request request) =>
            string.IsNullOrWhiteSpace(request.Username) ||
            string.IsNullOrWhiteSpace(request.Password)
                ? "Username and password are required."
                : null;
    }

    private static async Task<IResult> Handle(
        HttpContext context,
        IWebHostEnvironment environment,
        Request request,
        UserManager<IdentityUser> userManager,
        SignInManager<IdentityUser> signInManager,
        JwtTokenService tokenService)
    {
        var error = Validator.Validate(request);
        if (error is not null) return ApiResults.Validation("credentials", error);

        var user = await userManager.FindByNameAsync(request.Username);
        if (user is null) return Results.Unauthorized();

        var result = await signInManager.CheckPasswordSignInAsync(
            user,
            request.Password,
            lockoutOnFailure: true);
        if (!result.Succeeded) return Results.Unauthorized();

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
                Path = "/",
            });

        return Results.NoContent();
    }

    public sealed class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapPost("/auth/login", Handle)
                .WithTags("Authentication")
                .WithName("Login");
    }
}
