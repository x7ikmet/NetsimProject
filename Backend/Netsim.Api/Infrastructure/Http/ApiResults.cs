namespace Netsim.Api.Infrastructure.Http;

public static class ApiResults
{
    public static IResult Validation(string field, string error) =>
        Results.ValidationProblem(new Dictionary<string, string[]>
        {
            [field] = [error],
        });

    public static IResult BadRequest(string detail) =>
        Results.Problem(
            statusCode: StatusCodes.Status400BadRequest,
            title: "Bad request",
            detail: detail);

    public static IResult NotFound(string detail) =>
        Results.Problem(
            statusCode: StatusCodes.Status404NotFound,
            title: "Resource not found",
            detail: detail);

    public static IResult Conflict(string detail) =>
        Results.Problem(
            statusCode: StatusCodes.Status409Conflict,
            title: "Conflict",
            detail: detail);
}
