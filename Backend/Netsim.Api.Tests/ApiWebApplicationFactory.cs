using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Netsim.Api.Tests;

public sealed class ApiWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.UseSetting(
            "ConnectionStrings:IdentityDatabase",
            "Database=localhost/3050:C:\\tests\\unused.fdb;User=SYSDBA;Password=masterkey;Charset=UTF8");
        builder.UseSetting("JWT_ISSUER", "netsim-tests");
        builder.UseSetting("JWT_AUDIENCE", "netsim-tests");
        builder.UseSetting("JWT_KEY", Convert.ToBase64String(new byte[32]));
        builder.UseSetting("CLIENT_ORIGIN", "http://localhost");
        builder.UseSetting("N4_BASE_URL", "http://localhost");
    }
}
