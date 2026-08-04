using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;

namespace Netsim.Api.Auth;

public sealed class JwtTokenService(JwtOptions options)
{
    public TokenResponse Create(IdentityUser user)
    {
        var now = DateTime.UtcNow;
        var expiresAt = now.AddMinutes(30);

        var claims = new[]
        {
          new Claim(JwtRegisteredClaimNames.Sub, user.Id),
          new Claim(JwtRegisteredClaimNames.UniqueName, user.UserName!),
          new Claim(
            JwtRegisteredClaimNames.Jti,
            Guid.NewGuid().ToString()) 
        };

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
            expiresAt
        );
    }
}

public sealed record TokenResponse(
    string AccessToken,
    DateTime ExpriceAtUtc
);
