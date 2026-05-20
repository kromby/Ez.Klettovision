using Azure.Data.Tables;
using KlettovisionApi.Models;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System.Text.Json;
using System.Text.Json.Serialization;

var host = new HostBuilder()
    .ConfigureFunctionsWebApplication()
    .ConfigureServices(services =>
    {
        services.AddSingleton(sp =>
        {
            var conn = Environment.GetEnvironmentVariable("TABLE_STORAGE_CONNECTION")
                ?? throw new InvalidOperationException("TABLE_STORAGE_CONNECTION is not set.");
            return new TableServiceClient(conn);
        });

        services.Configure<JsonSerializerOptions>(o =>
        {
            o.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
            o.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
        });

        services.AddSingleton<AppConfig>(sp =>
        {
            var path = Path.Combine(AppContext.BaseDirectory, "config.json");
            if (!File.Exists(path))
                throw new FileNotFoundException($"config.json not found at: {path}");
            var json = File.ReadAllText(path);
            return JsonSerializer.Deserialize<AppConfig>(json,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true })
                ?? throw new InvalidOperationException("config.json deserialized to null.");
        });
    })
    .Build();

await host.RunAsync();
