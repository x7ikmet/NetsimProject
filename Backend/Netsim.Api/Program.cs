using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Netsim.Api.Data;
using Netsim.Api.Auth;

DotNetEnv.Env.Load();

var builder = WebApplication.CreateBuilder(args);

var connectionString =
    builder.Configuration.GetConnectionString("IdentityDatabase")
    ?? throw new InvalidOperationException(
        "Connection string 'IdentityDatabase' was not found.");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseFirebird(connectionString));
builder.Services
      .AddIdentityApiEndpoints<IdentityUser>(options =>
          options.Stores.MaxLengthForKeys = ApplicationDbContext.IdentityKeyLength)
      .AddEntityFrameworkStores<ApplicationDbContext>();
builder.Services.AddAuthorization();

var app = builder.Build();

if (await UserProvisioning.TryRunAsync(app, args))
{
    return;
}


app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/", () => "Hello World!");
app.MapAuthEndpoints();

app.Run();
