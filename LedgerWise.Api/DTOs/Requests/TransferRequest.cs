namespace LedgerWise.Api.DTOs.Requests;
using System.ComponentModel.DataAnnotations;
public class TransferRequest
{
  [Required]
  [EmailAddress]
  public string ReceiverEmail {get; set;} = string.Empty;
  public decimal Amount {get; set;}
}