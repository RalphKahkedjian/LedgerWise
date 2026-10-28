namespace LedgerWise.Api.Models;

public class PendingTransfer
{
    public int Id { get; set; }

    public int SenderUserId { get; set; }
    public User SenderUser { get; set; } = null!;

    public int ReceiverUserId { get; set; }
    public User ReceiverUser { get; set; } = null!;

    public decimal Amount { get; set; }

    public string Status { get; set; } = "Pending";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? RespondedAt { get; set; }
}