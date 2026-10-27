using LedgerWise.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LedgerWise.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<Wallet> Wallets => Set<Wallet>();
    public DbSet<Category> Categories => Set<Category>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Transaction>()
            .HasOne(t => t.CounterpartyUser)
            .WithMany()
            .HasForeignKey(t => t.CounterpartyUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}