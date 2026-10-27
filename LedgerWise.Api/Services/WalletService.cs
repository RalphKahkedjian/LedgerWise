using LedgerWise.Api.Common;
using LedgerWise.Api.Data;
using LedgerWise.Api.DTOs.Requests;
using LedgerWise.Api.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace LedgerWise.Api.Services;

public class WalletService : IWalletService
{
    private readonly AppDbContext _context;

    public WalletService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ServiceResult<object>> DepositAsync(
        ClaimsPrincipal user,
        AmountRequest request)
    {
        if (request.Amount <= 0)
            return ServiceResult<object>.Fail("Amount must be greater than zero.");

        var userId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var wallet = await _context.Wallets
            .FirstOrDefaultAsync(w => w.UserId == userId);

        if (wallet == null)
            return ServiceResult<object>.Fail("Wallet not found.");

        wallet.Balance += request.Amount;

        _context.Transactions.Add(new Transaction
        {
            WalletId = wallet.Id,
            Amount = request.Amount,
            Type = "Deposit"
        });

        await _context.SaveChangesAsync();

        return ServiceResult<object>.Ok(new
        {
            wallet.Balance
        });
    }

    public async Task<ServiceResult<object>> WithdrawAsync(
        ClaimsPrincipal user,
        AmountRequest request)
    {
        if (request.Amount <= 0)
            return ServiceResult<object>.Fail("Amount must be greater than zero.");

        var userId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var wallet = await _context.Wallets
            .FirstOrDefaultAsync(w => w.UserId == userId);

        if (wallet == null)
            return ServiceResult<object>.Fail("Wallet not found.");

        if (wallet.Balance < request.Amount)
            return ServiceResult<object>.Fail("Insufficient funds.");

        wallet.Balance -= request.Amount;

        _context.Transactions.Add(new Transaction
        {
            WalletId = wallet.Id,
            Amount = request.Amount,
            Type = "Withdraw"
        });

        await _context.SaveChangesAsync();

        return ServiceResult<object>.Ok(new
        {
            wallet.Balance
        });
    }

    public async Task<ServiceResult<object>> TransferAsync(
        ClaimsPrincipal user,
        TransferRequest request)
    {
        if (request.Amount <= 0)
            return ServiceResult<object>.Fail("Amount must be greater than zero.");

        var senderUserId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var senderWallet = await _context.Wallets
            .FirstOrDefaultAsync(w => w.UserId == senderUserId);

        if (senderWallet == null)
            return ServiceResult<object>.Fail("Sender wallet not found.");

        var receiverWallet = await _context.Wallets
            .FirstOrDefaultAsync(w => w.User.Email.ToLower() == request.ReceiverEmail.ToLower());

        if (receiverWallet == null)
            return ServiceResult<object>.Fail("Receiver wallet not found.");

        if (senderWallet.UserId == receiverWallet.UserId)
            return ServiceResult<object>.Fail("You cannot transfer money to yourself.");

        if (senderWallet.Balance < request.Amount)
            return ServiceResult<object>.Fail("Insufficient funds.");

        await using var dbTransaction =
            await _context.Database.BeginTransactionAsync();

        try
        {
            senderWallet.Balance -= request.Amount;
            receiverWallet.Balance += request.Amount;

            _context.Transactions.Add(new Transaction
            {
                WalletId = senderWallet.Id,
                Amount = request.Amount,
                Type = "Transfer Out",
                CounterpartyUserId = receiverWallet.UserId
            });

            _context.Transactions.Add(new Transaction
            {
                WalletId = receiverWallet.Id,
                Amount = request.Amount,
                Type = "Transfer In",
                CounterpartyUserId = senderWallet.UserId
            });

            await _context.SaveChangesAsync();

            await dbTransaction.CommitAsync();

            return ServiceResult<object>.Ok(new
            {
                Message = "Transfer successful",
                SenderBalance = senderWallet.Balance
            });
        }
        catch (Exception ex)
        {
            await dbTransaction.RollbackAsync();

            return ServiceResult<object>.Fail(ex.Message);
        }
    }

    public async Task<ServiceResult<Wallet>> GetWalletAsync(
        ClaimsPrincipal user
    )
    {
        var userId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
        
        var wallet = await _context.Wallets
            .FirstOrDefaultAsync(w => w.UserId == userId);

        if (wallet == null)
            return ServiceResult<Wallet>.Fail("Wallet not found");

        return ServiceResult<Wallet>.Ok(wallet);
    }

     public async Task<ServiceResult<List<TransactionResponse>>> GetTransactionsAsync(
        ClaimsPrincipal user
     )
    {
        var userId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var wallet = await _context.Wallets
                .FirstOrDefaultAsync(w => w.UserId == userId);

        if (wallet == null)
                return ServiceResult<List<TransactionResponse>>
                        .Fail("Wallet not found");

        var transactions = await _context.Transactions
            .Where(t => t.WalletId == wallet.Id)
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new TransactionResponse
            {
                Id = t.Id,
                Amount = t.Amount,
                Type = t.Type,
                CreatedAt = t.CreatedAt,

                CounterpartyUserId = t.CounterpartyUserId,

                CounterpartyName = t.CounterpartyUser != null
                    ? t.CounterpartyUser.Name
                    : null,

                CounterpartyEmail = t.CounterpartyUser != null
                    ? t.CounterpartyUser.Email
                    : null
            })
            .ToListAsync();

        return ServiceResult<List<TransactionResponse>>
                        .Ok(transactions);
    }
}