using Azure.Data.Tables;
using KlettovisionApi.Models;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using System.Net;

namespace KlettovisionApi.Functions;

public class AdminFunction(TableServiceClient tableService, AppConfig config)
{
    private static readonly string AdminPin =
        Environment.GetEnvironmentVariable("ADMIN_PIN") ?? "";

    private bool IsAuthorized(HttpRequestData req) =>
        req.Headers.TryGetValues("X-Admin-Pin", out var values)
        && values.FirstOrDefault() == AdminPin
        && !string.IsNullOrEmpty(AdminPin);

    private TableClient GetTable() => tableService.GetTableClient("Votes");

    [Function("AdminGetVotes")]
    public async Task<HttpResponseData> GetVotes(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "admin/votes")] HttpRequestData req)
    {
        if (!IsAuthorized(req))
            return req.CreateResponse(HttpStatusCode.Unauthorized);

        await GetTable().CreateIfNotExistsAsync();
        var votes = GetTable()
            .QueryAsync<VoteEntity>(e => e.PartitionKey == config.Year)
            .ToBlockingEnumerable()
            .ToList();

        var voteMap = votes.ToDictionary(v => v.JudgeName);
        var result = config.Judges
            .Where(j => voteMap.ContainsKey(j))
            .Select(j => new AdminVoteItem(voteMap[j].RowKey, j, voteMap[j].RevealStage))
            .ToList();

        var res = req.CreateResponse(HttpStatusCode.OK);
        await res.WriteAsJsonAsync(result);
        return res;
    }

    [Function("AdminRevealVote")]
    public async Task<HttpResponseData> RevealVote(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "admin/votes/{id}/reveal")] HttpRequestData req,
        string id)
    {
        if (!IsAuthorized(req))
            return req.CreateResponse(HttpStatusCode.Unauthorized);

        await GetTable().CreateIfNotExistsAsync();

        var vote = GetTable()
            .QueryAsync<VoteEntity>(e => e.PartitionKey == config.Year && e.RowKey == id)
            .ToBlockingEnumerable()
            .FirstOrDefault();

        if (vote is null)
            return req.CreateResponse(HttpStatusCode.NotFound);

        if (vote.RevealStage >= 3)
            return req.CreateResponse(HttpStatusCode.OK); // idempotent — already done

        vote.RevealStage++;
        await GetTable().UpdateEntityAsync(vote, vote.ETag);

        var res = req.CreateResponse(HttpStatusCode.OK);
        await res.WriteAsJsonAsync(new AdminVoteItem(vote.RowKey, vote.JudgeName, vote.RevealStage));
        return res;
    }
}
