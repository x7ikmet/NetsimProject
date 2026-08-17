using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace Netsim.Api.Infrastructure.Authentication;

public static class ClaimsPrincipalExtensions
{
    public static string? GetUserId(this ClaimsPrincipal user) =>
        user.FindFirstValue(JwtRegisteredClaimNames.Sub);
}
