using Netsim.Api.Infrastructure;
using Netsim.Api.Infrastructure.Authentication;
using Netsim.Api.Infrastructure.Endpoints;
using Netsim.Api.Infrastructure.Proxy;

DotNetEnv.Env.Load();

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddEndpoints(typeof(Program).Assembly);

var app = builder.Build();

if (await UserProvisioning.TryRunAsync(app, args))
{
    return;
}

app.UseExceptionHandler();
app.UseCors(DependencyInjection.ClientCorsPolicy);
app.UseAuthentication();
app.UseAuthorization();
app.UseAntiforgery();

app.MapEndpoints();
app.MapN4ReverseProxy();

app.Run();

public partial class Program;
