
namespace Netsim.Api.Auth;

public sealed record JwtOptions(
    string Issuer,
    string Audience,
    byte[] Key)
{
    public static JwtOptions FromConfiguration(
        IConfiguration configuration
    )
    {
        var issuer = configuration["JWT_ISSUER"]
            ?? throw new InvalidOperationException("JWT_ISSUER is missing");
        var audience = configuration["JWT_AUDIENCE"]
            ?? throw new InvalidOperationException("JWT_ISSUER is missing");
        var encodedKey = configuration["JWT_KEY"]
            ?? throw new InvalidOperationException("JWT_ISSUER is missing");

        byte[] key;
        try
        {
            key = Convert.FromBase64String(encodedKey);
        }
        catch (FormatException exception)
        {
            throw new InvalidOperationException(
                "JWT_KEY must be a valid Base64 value",
                exception);
        }

        if (key.Length < 32)
        {
            throw new InvalidOperationException(
                "JWT_KEY must contain at least 32 random bytes");
        }

        return new JwtOptions(issuer, audience, key);
    }
}
