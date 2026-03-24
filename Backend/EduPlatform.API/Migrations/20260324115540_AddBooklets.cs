using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduPlatform.API.Migrations
{
    /// <inheritdoc />
    public partial class AddBooklets : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "BookletId",
                table: "PaymentRequests",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Booklets",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Title = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: true),
                    PdfUrl = table.Column<string>(type: "TEXT", nullable: false),
                    CoverImageUrl = table.Column<string>(type: "TEXT", nullable: true),
                    Subject = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    GradeLevel = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    Price = table.Column<decimal>(type: "TEXT", nullable: false),
                    IsPublished = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Booklets", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PaymentRequests_BookletId",
                table: "PaymentRequests",
                column: "BookletId");

            migrationBuilder.AddForeignKey(
                name: "FK_PaymentRequests_Booklets_BookletId",
                table: "PaymentRequests",
                column: "BookletId",
                principalTable: "Booklets",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PaymentRequests_Booklets_BookletId",
                table: "PaymentRequests");

            migrationBuilder.DropTable(
                name: "Booklets");

            migrationBuilder.DropIndex(
                name: "IX_PaymentRequests_BookletId",
                table: "PaymentRequests");

            migrationBuilder.DropColumn(
                name: "BookletId",
                table: "PaymentRequests");
        }
    }
}
