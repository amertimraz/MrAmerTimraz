using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduPlatform.API.Migrations
{
    /// <inheritdoc />
    public partial class SyncPreExistingModelDrift : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "InteractiveQuestions");

            migrationBuilder.DropTable(
                name: "InteractiveQuizResults");

            migrationBuilder.DropTable(
                name: "InteractiveQuizzes");

            migrationBuilder.AlterColumn<int>(
                name: "StudentId",
                table: "PaymentRequests",
                type: "INTEGER",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AddColumn<string>(
                name: "DownloadToken",
                table: "PaymentRequests",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExternalTransactionId",
                table: "PaymentRequests",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GuestName",
                table: "PaymentRequests",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GuestPhone",
                table: "PaymentRequests",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PaymentGateway",
                table: "PaymentRequests",
                type: "TEXT",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "LibraryStudentInfos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    UserType = table.Column<string>(type: "TEXT", nullable: false),
                    Phone = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    Governorate = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    NoteTitle = table.Column<string>(type: "TEXT", maxLength: 300, nullable: false),
                    NoteId = table.Column<int>(type: "INTEGER", nullable: false),
                    Action = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LibraryStudentInfos", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LibraryStudentInfos");

            migrationBuilder.DropColumn(
                name: "DownloadToken",
                table: "PaymentRequests");

            migrationBuilder.DropColumn(
                name: "ExternalTransactionId",
                table: "PaymentRequests");

            migrationBuilder.DropColumn(
                name: "GuestName",
                table: "PaymentRequests");

            migrationBuilder.DropColumn(
                name: "GuestPhone",
                table: "PaymentRequests");

            migrationBuilder.DropColumn(
                name: "PaymentGateway",
                table: "PaymentRequests");

            migrationBuilder.AlterColumn<int>(
                name: "StudentId",
                table: "PaymentRequests",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldNullable: true);

            migrationBuilder.CreateTable(
                name: "InteractiveQuizzes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    AllowSkipWithoutRegistration = table.Column<bool>(type: "INTEGER", nullable: false),
                    CoverImageUrl = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: true),
                    FacebookUrl = table.Column<string>(type: "TEXT", nullable: true),
                    GoldenEvery = table.Column<int>(type: "INTEGER", nullable: false),
                    Grade = table.Column<string>(type: "TEXT", nullable: true),
                    McqPerStage = table.Column<int>(type: "INTEGER", nullable: false),
                    QuestionsPerStage = table.Column<int>(type: "INTEGER", nullable: false),
                    ShowSupportButton = table.Column<bool>(type: "INTEGER", nullable: false),
                    Slug = table.Column<string>(type: "TEXT", nullable: true),
                    StageCount = table.Column<int>(type: "INTEGER", nullable: false),
                    Subject = table.Column<string>(type: "TEXT", nullable: true),
                    TeacherImage = table.Column<string>(type: "TEXT", nullable: true),
                    TeacherName = table.Column<string>(type: "TEXT", nullable: true),
                    TeacherWhatsappNumber = table.Column<string>(type: "TEXT", nullable: true),
                    TfPerStage = table.Column<int>(type: "INTEGER", nullable: false),
                    Theme = table.Column<string>(type: "TEXT", nullable: true),
                    TimerDuration = table.Column<int>(type: "INTEGER", nullable: false),
                    TimerEnabled = table.Column<bool>(type: "INTEGER", nullable: false),
                    Title = table.Column<string>(type: "TEXT", maxLength: 300, nullable: false),
                    ViewCount = table.Column<int>(type: "INTEGER", nullable: false),
                    WhatsappUrl = table.Column<string>(type: "TEXT", nullable: true),
                    YoutubeUrl = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InteractiveQuizzes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "InteractiveQuestions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    QuizId = table.Column<int>(type: "INTEGER", nullable: false),
                    CorrectAnswer = table.Column<string>(type: "TEXT", nullable: true),
                    Explanation = table.Column<string>(type: "TEXT", nullable: true),
                    Options = table.Column<string>(type: "TEXT", nullable: true),
                    OrderIndex = table.Column<int>(type: "INTEGER", nullable: false),
                    Text = table.Column<string>(type: "TEXT", nullable: false),
                    Type = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InteractiveQuestions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InteractiveQuestions_InteractiveQuizzes_QuizId",
                        column: x => x.QuizId,
                        principalTable: "InteractiveQuizzes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "InteractiveQuizResults",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    QuizId = table.Column<int>(type: "INTEGER", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CorrectCount = table.Column<int>(type: "INTEGER", nullable: false),
                    Percentage = table.Column<double>(type: "REAL", nullable: false),
                    PlayerName = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Score = table.Column<int>(type: "INTEGER", nullable: false),
                    SessionId = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    TotalCount = table.Column<int>(type: "INTEGER", nullable: false)
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
                name: "IX_InteractiveQuestions_QuizId",
                table: "InteractiveQuestions",
                column: "QuizId");

            migrationBuilder.CreateIndex(
                name: "IX_InteractiveQuizResults_QuizId_SessionId",
                table: "InteractiveQuizResults",
                columns: new[] { "QuizId", "SessionId" },
                unique: true);
        }
    }
}
