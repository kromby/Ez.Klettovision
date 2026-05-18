namespace KlettovisionApi.Models;

public class AppConfig
{
    public string Year { get; set; } = "";
    public List<CountryConfig> Countries { get; set; } = [];
    public List<string> Judges { get; set; } = [];
}

public class CountryConfig
{
    public string Code { get; set; } = "";
    public string Name { get; set; } = "";
}
