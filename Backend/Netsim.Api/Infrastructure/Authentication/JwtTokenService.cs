using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;

namespace Netsim.Api.Infrastructure.Authentication;

public sealed class JwtTokenService(JwtOptions options)
{
    public const string CookieName = "netsim_access_token";

    public TokenResponse Create(IdentityUser user, IEnumerable<string> roles)
    {
        var now = DateTime.UtcNow;
        var expiresAt = now.AddMinutes(30);

        var sessionId = Guid.NewGuid().ToString();
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.UniqueName, user.UserName!),
            new(JwtRegisteredClaimNames.Jti, sessionId),
        };
        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(options.Key),
            SecurityAlgorithms.HmacSha256
        );
         var token = new JwtSecurityToken(
            issuer: options.Issuer,
            audience: options.Audience,
            claims: claims,
            notBefore: now,
            expires: expiresAt,
            signingCredentials: credentials);

        return new TokenResponse(
            new JwtSecurityTokenHandler().WriteToken(token),
            expiresAt,
            sessionId
        );
    }
}

public sealed record TokenResponse(
    string AccessToken,
    DateTime ExpiresAtUtc,
    string SessionId
);
