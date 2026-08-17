using Netsim.Api.Features.Authentication;
using Xunit;

namespace Netsim.Api.Tests.Features.Authentication;

public sealed class LoginTests
{
    [Fact]
    public void Validator_RejectsMissingCredentials()
    {
        var request = new Login.Request("", "");

        var error = Login.Validator.Validate(request);

        Assert.Equal("Username and password are required.", error);
    }
}
