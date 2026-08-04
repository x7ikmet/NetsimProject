using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Netsim.Api.Data;

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
          options.Stores.MaxLengthForKeys = 64)
      .AddEntityFrameworkStores<ApplicationDbContext>();
builder.Services.AddAuthorization();

var app = builder.Build();

if (args.Contains("--create-user"))
{
    var email = Environment.GetEnvironmentVariable("NETSIM_USER_EMAIL")
        ?? throw new InvalidOperationException("NETSIM_USER_EMAIL is missing.");
    var password = Environment.GetEnvironmentVariable("NETSIM_USER_PASSWORD")
        ?? throw new InvalidOperationException("NETSIM_USER_PASSWORD is missing.");
    await using var scope = app.Services.CreateAsyncScope();
    var userManager =
        scope.ServiceProvider.GetRequiredService<UserManager<IdentityUser>>();
    var result = await userManager.CreateAsync(
        new IdentityUser
        {
            UserName = email,
            Email = email,
            EmailConfirmed = true
        },
        password);
    if (!result.Succeeded)
    {
        throw new InvalidOperationException(
            string.Join(
                Environment.NewLine,
                result.Errors.Select(error => error.Description)));
    }
    Console.WriteLine($"Created user: {email}");
    return;
}


app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/", () => "Hello World!");

app.Run();
