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
            return ServiceResult<object>.Fail(
                "Amount must be greater than zero.");

        var senderIdClaim =
            user.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(senderIdClaim, out var senderUserId))
            return ServiceResult<object>.Fail("Invalid user.");

        var receiverEmail = request.ReceiverEmail?.Trim();

        if (string.IsNullOrWhiteSpace(receiverEmail))
            return ServiceResult<object>.Fail(
                "Receiver email is required.");

        var senderWallet = await _context.Wallets
            .AsNoTracking()
            .FirstOrDefaultAsync(w => w.UserId == senderUserId);

        if (senderWallet == null)
            return ServiceResult<object>.Fail(
                "Sender wallet not found.");

        var receiverWallet = await _context.Wallets
            .AsNoTracking()
            .FirstOrDefaultAsync(w =>
                w.User.Email.ToLower() == receiverEmail.ToLower());

        if (receiverWallet == null)
            return ServiceResult<object>.Fail(
                "Receiver wallet not found.");

        if (senderWallet.UserId == receiverWallet.UserId)
            return ServiceResult<object>.Fail(
                "You cannot transfer money to yourself.");

        await using var dbTransaction =
            await _context.Database.BeginTransactionAsync();

        try
        {
            // Atomically reserve funds only if enough balance remains.
            var updatedRows = await _context.Wallets
                .Where(w =>
                    w.Id == senderWallet.Id &&
                    w.Balance >= request.Amount)
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(
                        w => w.Balance,
                        w => w.Balance - request.Amount));

            if (updatedRows != 1)
            {
                await dbTransaction.RollbackAsync();

                return ServiceResult<object>.Fail(
                    "Insufficient funds.");
            }

            var pendingTransfer = new PendingTransfer
            {
                SenderUserId = senderUserId,
                ReceiverUserId = receiverWallet.UserId,
                Amount = request.Amount,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            _context.PendingTransfers.Add(pendingTransfer);

            await _context.SaveChangesAsync();

            await dbTransaction.CommitAsync();

            return ServiceResult<object>.Ok(new
            {
                Message = "Transfer request sent. Awaiting recipient approval.",
                TransferId = pendingTransfer.Id,
                Status = pendingTransfer.Status
            });
        }
        catch (Exception)
        {
            await dbTransaction.RollbackAsync();

            return ServiceResult<object>.Fail(
                "Unable to create transfer request. Please try again.");
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

        
    public async Task<ServiceResult<object>> AcceptTransferAsync(
        ClaimsPrincipal user,
        int transferId)
    {
        var userIdClaim = user.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(userIdClaim, out var userId))
            return ServiceResult<object>.Fail("Invalid user.");

        await using var dbTransaction =
            await _context.Database.BeginTransactionAsync();

        try
        {
            // Only the intended recipient can accept a pending transfer.
            // The conditional update prevents duplicate acceptance.
            var updatedRows = await _context.PendingTransfers
                .Where(p =>
                    p.Id == transferId &&
                    p.ReceiverUserId == userId &&
                    p.Status == "Pending")
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(p => p.Status, "Accepted")
                    .SetProperty(p => p.RespondedAt, DateTime.UtcNow));

            if (updatedRows != 1)
            {
                await dbTransaction.RollbackAsync();

                return ServiceResult<object>.Fail(
                    "Transfer not found, already processed, or unauthorized.");
            }

            var pendingTransfer = await _context.PendingTransfers
                .AsNoTracking()
                .FirstAsync(p => p.Id == transferId);

            // Atomically credit the recipient's wallet.
            var creditedRows = await _context.Wallets
                .Where(w => w.UserId == userId)
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(
                        w => w.Balance,
                        w => w.Balance + pendingTransfer.Amount));

            if (creditedRows != 1)
                throw new InvalidOperationException(
                    "Recipient wallet not found.");

            var senderWalletId = await _context.Wallets
                .Where(w => w.UserId == pendingTransfer.SenderUserId)
                .Select(w => w.Id)
                .SingleAsync();

            var receiverWalletId = await _context.Wallets
                .Where(w => w.UserId == userId)
                .Select(w => w.Id)
                .SingleAsync();

            _context.Transactions.Add(new Transaction
            {
                WalletId = senderWalletId,
                Amount = pendingTransfer.Amount,
                Type = "Transfer Out",
                CounterpartyUserId = userId
            });

            _context.Transactions.Add(new Transaction
            {
                WalletId = receiverWalletId,
                Amount = pendingTransfer.Amount,
                Type = "Transfer In",
                CounterpartyUserId = pendingTransfer.SenderUserId
            });

            await _context.SaveChangesAsync();

            await dbTransaction.CommitAsync();

            return ServiceResult<object>.Ok(new
            {
                Message = "Transfer accepted successfully.",
                TransferId = pendingTransfer.Id,
                Status = "Accepted"
            });
        }
        catch (Exception)
        {
            await dbTransaction.RollbackAsync();

            return ServiceResult<object>.Fail(
                "Unable to accept transfer. Please try again.");
        }
    }
    
    public async Task<ServiceResult<object>> GetIncomingTransfersAsync(
        ClaimsPrincipal user)
    {
        var userIdClaim =
            user.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(userIdClaim, out var userId))
            return ServiceResult<object>.Fail("Invalid user.");

        var transfers = await _context.PendingTransfers
            .AsNoTracking()
            .Where(p => p.ReceiverUserId == userId)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new
            {
                p.Id,
                p.Amount,
                p.Status,
                p.CreatedAt,
                p.RespondedAt,

                SenderName = p.SenderUser.Name,
                SenderEmail = p.SenderUser.Email
            })
            .ToListAsync();

        return ServiceResult<object>.Ok(transfers);
    }

    
    public async Task<ServiceResult<object>> RejectTransferAsync(
        ClaimsPrincipal user,
        int transferId)
    {
        var userIdClaim = user.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(userIdClaim, out var userId))
            return ServiceResult<object>.Fail("Invalid user.");

        await using var dbTransaction =
            await _context.Database.BeginTransactionAsync();

        try
        {
            // Only the recipient can reject a pending transfer.
            // A conditional update prevents duplicate refunds.
            var updatedRows = await _context.PendingTransfers
                .Where(p =>
                    p.Id == transferId &&
                    p.ReceiverUserId == userId &&
                    p.Status == "Pending")
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(p => p.Status, "Rejected")
                    .SetProperty(p => p.RespondedAt, DateTime.UtcNow));

            if (updatedRows != 1)
            {
                await dbTransaction.RollbackAsync();

                return ServiceResult<object>.Fail(
                    "Transfer not found, already processed, or unauthorized.");
            }

            var pendingTransfer = await _context.PendingTransfers
                .AsNoTracking()
                .FirstAsync(p => p.Id == transferId);

            // Atomically return reserved funds to the sender.
            var refundedRows = await _context.Wallets
                .Where(w => w.UserId == pendingTransfer.SenderUserId)
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(
                        w => w.Balance,
                        w => w.Balance + pendingTransfer.Amount));

            if (refundedRows != 1)
                throw new InvalidOperationException(
                    "Sender wallet not found.");

            await dbTransaction.CommitAsync();

            return ServiceResult<object>.Ok(new
            {
                Message = "Transfer rejected. Funds returned to sender.",
                TransferId = pendingTransfer.Id,
                Status = "Rejected"
            });
        }
        catch (Exception)
        {
            await dbTransaction.RollbackAsync();

            return ServiceResult<object>.Fail(
                "Unable to reject transfer. Please try again.");
        }
    }

    
    public async Task<ServiceResult<object>> GetOutgoingTransfersAsync(
        ClaimsPrincipal user)
    {
        var userIdClaim =
            user.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(userIdClaim, out var userId))
            return ServiceResult<object>.Fail("Invalid user.");

        var transfers = await _context.PendingTransfers
            .AsNoTracking()
            .Where(p => p.SenderUserId == userId)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new
            {
                p.Id,
                p.Amount,
                p.Status,
                p.CreatedAt,
                p.RespondedAt,

                ReceiverName = p.ReceiverUser.Name,
                ReceiverEmail = p.ReceiverUser.Email
            })
            .ToListAsync();

        return ServiceResult<object>.Ok(transfers);
    }


}