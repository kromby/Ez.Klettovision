using Microsoft.Azure.Functions.Worker.Http;

namespace KlettovisionApi;

public static class ApiKeyAuth
{
    private static readonly string ApiKey =
        Environment.GetEnvironmentVariable("API_KEY") ?? "";

    public static bool IsValid(HttpRequestData req) =>
        !string.IsNullOrEmpty(ApiKey)
        && req.Headers.TryGetValues("X-Api-Key", out var values)
        && values.FirstOrDefault() == ApiKey;
}
