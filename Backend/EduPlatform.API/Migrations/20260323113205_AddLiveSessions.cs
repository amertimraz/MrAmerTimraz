using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduPlatform.API.Migrations
{
    /// <inheritdoc />
    public partial class AddLiveSessions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "CourseId",
                table: "PaymentRequests",
                type: "INTEGER",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AddColumn<int>(
                name: "LiveSessionId",
                table: "PaymentRequests",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "LiveSessions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Title = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: true),
                    ScheduledAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    JoinUrl = table.Column<string>(type: "TEXT", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LiveSessions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LiveSessionEnrollments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    StudentId = table.Column<int>(type: "INTEGER", nullable: false),
                    LiveSessionId = table.Column<int>(type: "INTEGER", nullable: false),
                    EnrolledAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LiveSessionEnrollments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LiveSessionEnrollments_LiveSessions_LiveSessionId",
                        column: x => x.LiveSessionId,
                        principalTable: "LiveSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LiveSessionEnrollments_Users_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PaymentRequests_LiveSessionId",
                table: "PaymentRequests",
                column: "LiveSessionId");

            migrationBuilder.CreateIndex(
                name: "IX_LiveSessionEnrollments_LiveSessionId",
                table: "LiveSessionEnrollments",
                column: "LiveSessionId");

            migrationBuilder.CreateIndex(
                name: "IX_LiveSessionEnrollments_StudentId_LiveSessionId",
                table: "LiveSessionEnrollments",
                columns: new[] { "StudentId", "LiveSessionId" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_PaymentRequests_LiveSessions_LiveSessionId",
                table: "PaymentRequests",
                column: "LiveSessionId",
                principalTable: "LiveSessions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PaymentRequests_LiveSessions_LiveSessionId",
                table: "PaymentRequests");

            migrationBuilder.DropTable(
                name: "LiveSessionEnrollments");

            migrationBuilder.DropTable(
                name: "LiveSessions");

            migrationBuilder.DropIndex(
                name: "IX_PaymentRequests_LiveSessionId",
                table: "PaymentRequests");

            migrationBuilder.DropColumn(
                name: "LiveSessionId",
                table: "PaymentRequests");

            migrationBuilder.AlterColumn<int>(
                name: "CourseId",
                table: "PaymentRequests",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldNullable: true);
        }
    }
}
