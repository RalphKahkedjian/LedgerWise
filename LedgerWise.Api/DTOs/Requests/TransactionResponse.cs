namespace LedgerWise.Api.DTOs.Requests;

public class TransactionResponse
{
    public int Id { get; set; }

    public decimal Amount { get; set; }

    public string Type { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public int? CounterpartyUserId { get; set; }

    public string? CounterpartyName { get; set; }

    public string? CounterpartyEmail { get; set; }
}