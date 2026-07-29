namespace LedgerWise.Api.Models;

public class Category
{
  public int Id {get; set;}
  public string Name {get; set;} = string.Empty;
  public int UserId {get; set;}
  public User user {get; set;} = null!;

}