using LedgerWise.Api.Common;
using LedgerWise.Api.DTOs;
using LedgerWise.Api.DTOs.Requests;
using LedgerWise.Api.Models;
using System.Security.Claims;

namespace LedgerWise.Api.Services;

public interface IWalletService
{
    Task<ServiceResult<object>> DepositAsync(
        ClaimsPrincipal user,
        AmountRequest request);

    Task<ServiceResult<object>> WithdrawAsync(
        ClaimsPrincipal user,
        AmountRequest request);

    Task<ServiceResult<object>> TransferAsync(
        ClaimsPrincipal user,
        TransferRequest request);

    Task<ServiceResult<Wallet>> GetWalletAsync(
        ClaimsPrincipal user);

    Task<ServiceResult<List<TransactionResponse>>> GetTransactionsAsync(
        ClaimsPrincipal user);
}