namespace LedgerWise.Api.Models;

public class Transaction
{
    public int Id { get; set; }

    public int WalletId { get; set; }

    public Wallet Wallet { get; set; } = null!;

    public decimal Amount { get; set; }
    
     public string Type { get; set; } = string.Empty; // Deposit, Withdraw, Transfer

    public int? CategoryId {get; set;}

    public Category? category {get; set;}

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int? CounterpartyUserId { get; set; }

    public User? CounterpartyUser { get; set; }
}