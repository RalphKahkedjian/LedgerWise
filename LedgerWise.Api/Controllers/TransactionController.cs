using LedgerWise.Api.Data;
using LedgerWise.Api.DTOs.Responses;
using LedgerWise.Api.DTOs.Requests;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace LedgerWise.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TransactionController : ControllerBase
{
  private readonly AppDbContext _context;
  public TransactionController(AppDbContext context)
  {
    _context = context;
  }

  [HttpGet]
  public async Task<IActionResult> GetTransactions()
  {
    var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    var wallet = await _context.Wallets
      .FirstOrDefaultAsync(w => w.UserId == userId);

    if (wallet == null)
    {
      return NotFound("Wallet not found");
    }

    var transactions = await _context.Transactions
      .Where(t=> t.WalletId == wallet.Id)
      .OrderByDescending(t => t.CreatedAt)
      .Select (t => new TransactionResponse
      {
        Id = t.Id,
        Amount = t.Amount,
        Type = t.Type,
        CreatedAt = t.CreatedAt
      })
      .ToListAsync();

    return Ok(transactions);
  }
}