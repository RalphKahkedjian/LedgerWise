namespace LedgerWise.Api.DTOs.Requests;
public class TransferRequest
{
  public int ReceiverUserId {get; set;}
  public decimal Amount {get; set;}
}