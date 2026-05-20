using Azure.Data.Tables;
using KlettovisionApi.Models;
using KlettovisionApi.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using System.Net;
using System.Text.Json;

namespace KlettovisionApi.Functions;

public class VotesFunction(TableServiceClient tableService, AppConfig config)
{
    private TableClient GetTable() =>
        tableService.GetTableClient("Votes");

    [Function("GetAvailableJudges")]
    public async Task<HttpResponseData> GetAvailable(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "judges/available")] HttpRequestData req)
    {
        if (!ApiKeyAuth.IsValid(req))
            return req.CreateResponse(HttpStatusCode.Unauthorized);

        await GetTable().CreateIfNotExistsAsync();
        var submittedNames = GetTable()
            .QueryAsync<VoteEntity>(e => e.PartitionKey == config.Year)
            .ToBlockingEnumerable()
            .Select(v => v.JudgeName)
            .ToHashSet();

        var available = config.Judges.Where(j => !submittedNames.Contains(j)).ToList();
        var res = req.CreateResponse(HttpStatusCode.OK);
        await res.WriteAsJsonAsync(available);
        return res;
    }

    [Function("SubmitVote")]
    public async Task<HttpResponseData> Submit(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "votes")] HttpRequestData req)
    {
        if (!ApiKeyAuth.IsValid(req))
            return req.CreateResponse(HttpStatusCode.Unauthorized);

        SubmitVoteRequest? body;
        try
        {
            body = await JsonSerializer.DeserializeAsync<SubmitVoteRequest>(req.Body,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        }
        catch
        {
            return req.CreateResponse(HttpStatusCode.BadRequest);
        }

        if (body is null || string.IsNullOrWhiteSpace(body.JudgeName))
            return req.CreateResponse(HttpStatusCode.BadRequest);

        if (!config.Judges.Contains(body.JudgeName))
        {
            var r = req.CreateResponse(HttpStatusCode.BadRequest);
            await r.WriteStringAsync("Unknown judge name.");
            return r;
        }

        if (!ScoringService.ValidateRankings(body.Rankings, config))
        {
            var r = req.CreateResponse(HttpStatusCode.BadRequest);
            await r.WriteStringAsync("Rankings must contain exactly all country codes, each once.");
            return r;
        }

        await GetTable().CreateIfNotExistsAsync();

        var existing = GetTable()
            .QueryAsync<VoteEntity>(e => e.PartitionKey == config.Year && e.JudgeName == body.JudgeName)
            .ToBlockingEnumerable()
            .FirstOrDefault();

        if (existing is not null)
        {
            var r = req.CreateResponse(HttpStatusCode.Conflict);
            await r.WriteStringAsync("Vote already submitted.");
            return r;
        }

        var vote = new VoteEntity
        {
            PartitionKey = config.Year,
            RowKey = Guid.NewGuid().ToString(),
            JudgeName = body.JudgeName,
            Rankings = JsonSerializer.Serialize(body.Rankings),
            RevealStage = 0,
            SubmittedAt = DateTime.UtcNow.ToString("o"),
        };

        await GetTable().AddEntityAsync(vote);
        return req.CreateResponse(HttpStatusCode.Created);
    }

    [Function("GetVote")]
    public async Task<HttpResponseData> GetVote(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "votes/{judgeName}")] HttpRequestData req,
        string judgeName)
    {
        if (!ApiKeyAuth.IsValid(req))
            return req.CreateResponse(HttpStatusCode.Unauthorized);

        await GetTable().CreateIfNotExistsAsync();
        var vote = GetTable()
            .QueryAsync<VoteEntity>(e => e.PartitionKey == config.Year && e.JudgeName == judgeName)
            .ToBlockingEnumerable()
            .FirstOrDefault();

        if (vote is null)
            return req.CreateResponse(HttpStatusCode.NotFound);

        var rankings = JsonSerializer.Deserialize<string[]>(vote.Rankings) ?? [];
        var countryMap = config.Countries.ToDictionary(c => c.Code);

        var res = req.CreateResponse(HttpStatusCode.OK);
        await res.WriteAsJsonAsync(new
        {
            judgeName = vote.JudgeName,
            rankings = rankings.Select((code, i) => new
            {
                code,
                name = countryMap.TryGetValue(code, out var c) ? c.Name : code,
                points = i < 9 ? new[] { 12, 10, 8, 6, 5, 4, 3, 2, 1 }[i] : 0,
            }),
        });
        return res;
    }
}
