using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LedgerWise.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddTransactionCounterparty : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CounterpartyUserId",
                table: "Transactions",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_CounterpartyUserId",
                table: "Transactions",
                column: "CounterpartyUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_Users_CounterpartyUserId",
                table: "Transactions",
                column: "CounterpartyUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_Users_CounterpartyUserId",
                table: "Transactions");

            migrationBuilder.DropIndex(
                name: "IX_Transactions_CounterpartyUserId",
                table: "Transactions");

            migrationBuilder.DropColumn(
                name: "CounterpartyUserId",
                table: "Transactions");
        }
    }
}
