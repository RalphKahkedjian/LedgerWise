using System.Security.Claims;
using LedgerWise.Api.DTOs.Requests;
using LedgerWise.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LedgerWise.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WalletController : ControllerBase
{
  private readonly IWalletService _walletService;

  public WalletController(IWalletService walletService)
  {
      _walletService = walletService;
  }

  [HttpGet]
  public async Task<IActionResult> GetWallet()
  {
    var result = await _walletService.GetWalletAsync(User);

    if (!result.Success || result.Data == null)
        return NotFound(result.Message);
        
    return Ok(new
    {
        result.Data!.Id,
        result.Data.UserId,
        result.Data.Balance
    });
  }

[HttpPost("deposit")]
public async Task<IActionResult> Deposit(AmountRequest request)
{
    var result = await _walletService.DepositAsync(User, request);

    if (!result.Success)
        return BadRequest(result.Message);

    return Ok(result.Data);
}

  [HttpPost("withdraw")]
  public async Task<IActionResult> Withdraw(AmountRequest request)
  {
    var result = await _walletService.WithdrawAsync(User, request);

    if (!result.Success)
        return BadRequest(result.Message);

    return Ok(result.Data);
  }

  [HttpPost("transfer")]
  public async Task<IActionResult> Transfer(TransferRequest request)
  {
    var result = await _walletService.TransferAsync(User, request);

    if (!result.Success)
        return BadRequest(result.Message);

    return Ok(result.Data);
  }

  [HttpGet("transactions")]
  public async Task<IActionResult> GetTransactions()
  {
    var result = await _walletService.GetTransactionsAsync(User);

    if (!result.Success)
        return BadRequest(result.Message);

    return Ok(result.Data);
  }

  [HttpPost("transfers/{transferId:int}/accept")]
  public async Task<IActionResult> AcceptTransfer(int transferId)
  {
    var result = await _walletService.AcceptTransferAsync(User, transferId);
    if (!result.Success)
      return BadRequest(result.Message);

    return Ok(result.Data);
  }

  [HttpGet("transfers/incoming")]
  public async Task<IActionResult> GetIncomingTransfers()
  {
    var result = await _walletService.GetIncomingTransfersAsync(User);

    if (!result.Success)
      return BadRequest(result.Message);

    return Ok(result.Data);
  }

  [HttpPost("transfers/{transferId:int}/reject")]
  public async Task<IActionResult> RejectTransfer(int transferId)
  {
      var result = await _walletService.RejectTransferAsync(
          User, transferId);

      if (!result.Success)
          return BadRequest(result.Message);

      return Ok(result.Data);
  }

  [HttpGet("transfers/outgoing")]
  public async Task<IActionResult> GetOutgoingTransfers()
  {
      var result =
          await _walletService.GetOutgoingTransfersAsync(User);

      if (!result.Success)
          return BadRequest(result.Message);

      return Ok(result.Data);
  }
}