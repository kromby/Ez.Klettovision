using Azure.Data.Tables;
using KlettovisionApi.Models;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System.Text.Json;

var host = new HostBuilder()
    .ConfigureFunctionsWebApplication()
    .ConfigureServices(services =>
    {
        services.AddApplicationInsightsTelemetryWorkerService();
        services.ConfigureFunctionsApplicationInsights();

        services.AddSingleton(sp =>
        {
            var conn = Environment.GetEnvironmentVariable("AzureWebJobsStorage")!;
            return new TableServiceClient(conn);
        });

        services.AddSingleton<AppConfig>(sp =>
        {
            var path = Path.Combine(AppContext.BaseDirectory, "config.json");
            var json = File.ReadAllText(path);
            return JsonSerializer.Deserialize<AppConfig>(json,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true })!;
        });
    })
    .Build();

await host.RunAsync();
