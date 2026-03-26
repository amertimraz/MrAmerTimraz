using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduPlatform.API.Migrations
{
    /// <inheritdoc />
    public partial class AddTofasTestResults : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Price",
                table: "Challenges");

            migrationBuilder.RenameColumn(
                name: "IsVisible",
                table: "Challenges",
                newName: "TestId");

            migrationBuilder.AddColumn<int>(
                name: "OrderIndex",
                table: "Challenges",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "TofasTests",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Title = table.Column<string>(type: "TEXT", nullable: false),
                    Slug = table.Column<string>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false),
                    Price = table.Column<decimal>(type: "TEXT", nullable: false),
                    IsVisible = table.Column<bool>(type: "INTEGER", nullable: false),
                    TimeLimitMinutes = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TofasTests", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TofasTestResults",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    TestId = table.Column<int>(type: "INTEGER", nullable: false),
                    StudentId = table.Column<int>(type: "INTEGER", nullable: false),
                    Score = table.Column<int>(type: "INTEGER", nullable: false),
                    TotalQuestions = table.Column<int>(type: "INTEGER", nullable: false),
                    CorrectCount = table.Column<int>(type: "INTEGER", nullable: false),
                    Percentage = table.Column<double>(type: "REAL", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TofasTestResults", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TofasTestResults_TofasTests_TestId",
                        column: x => x.TestId,
                        principalTable: "TofasTests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TofasTestResults_Users_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Challenges_TestId",
                table: "Challenges",
                column: "TestId");

            migrationBuilder.CreateIndex(
                name: "IX_TofasTestResults_StudentId",
                table: "TofasTestResults",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_TofasTestResults_TestId",
                table: "TofasTestResults",
                column: "TestId");

            migrationBuilder.CreateIndex(
                name: "IX_TofasTests_Slug",
                table: "TofasTests",
                column: "Slug",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Challenges_TofasTests_TestId",
                table: "Challenges",
                column: "TestId",
                principalTable: "TofasTests",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Challenges_TofasTests_TestId",
                table: "Challenges");

            migrationBuilder.DropTable(
                name: "TofasTestResults");

            migrationBuilder.DropTable(
                name: "TofasTests");

            migrationBuilder.DropIndex(
                name: "IX_Challenges_TestId",
                table: "Challenges");

            migrationBuilder.DropColumn(
                name: "OrderIndex",
                table: "Challenges");

            migrationBuilder.RenameColumn(
                name: "TestId",
                table: "Challenges",
                newName: "IsVisible");

            migrationBuilder.AddColumn<decimal>(
                name: "Price",
                table: "Challenges",
                type: "TEXT",
                nullable: false,
                defaultValue: 0m);
        }
    }
}
