using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduPlatform.API.Migrations
{
    /// <inheritdoc />
    public partial class AddInteractiveQuizResults : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DownloadCount",
                table: "LibraryItems",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ViewCount",
                table: "LibraryItems",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "AllowSkipWithoutRegistration",
                table: "InteractiveQuizzes",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "InteractiveQuizResults",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    QuizId = table.Column<int>(type: "INTEGER", nullable: false),
                    SessionId = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    PlayerName = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Score = table.Column<int>(type: "INTEGER", nullable: false),
                    CorrectCount = table.Column<int>(type: "INTEGER", nullable: false),
                    TotalCount = table.Column<int>(type: "INTEGER", nullable: false),
                    Percentage = table.Column<double>(type: "REAL", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InteractiveQuizResults", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InteractiveQuizResults_InteractiveQuizzes_QuizId",
                        column: x => x.QuizId,
                        principalTable: "InteractiveQuizzes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_InteractiveQuizResults_QuizId_SessionId",
                table: "InteractiveQuizResults",
                columns: new[] { "QuizId", "SessionId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "InteractiveQuizResults");

            migrationBuilder.DropColumn(
                name: "DownloadCount",
                table: "LibraryItems");

            migrationBuilder.DropColumn(
                name: "ViewCount",
                table: "LibraryItems");

            migrationBuilder.DropColumn(
                name: "AllowSkipWithoutRegistration",
                table: "InteractiveQuizzes");
        }
    }
}
