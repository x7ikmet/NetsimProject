using Netsim.Api.Features.Scenarios;
using Xunit;

namespace Netsim.Api.Tests.Features.Scenarios;

public sealed class DuplicateScenarioTests
{
    [Fact]
    public void Validator_RejectsNamesLongerThanEightyCharacters()
    {
        var request = new DuplicateScenario.Request(new string('x', 81));

        var error = DuplicateScenario.Validator.Validate(request);

        Assert.Equal("Name must not exceed 80 characters.", error);
    }
}
