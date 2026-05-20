using KlettovisionApi.Models;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using System.Net;

namespace KlettovisionApi.Functions;

public class ConfigFunction(AppConfig config)
{
    [Function("GetConfig")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "config")] HttpRequestData req)
    {
        if (!ApiKeyAuth.IsValid(req))
            return req.CreateResponse(HttpStatusCode.Unauthorized);

        var res = req.CreateResponse(HttpStatusCode.OK);
        await res.WriteAsJsonAsync(new
        {
            year = config.Year,
            countries = config.Countries,
            judges = config.Judges,
        });
        return res;
    }
}
