using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduPlatform.API.Migrations
{
    /// <inheritdoc />
    public partial class AddMuxSupportAndVideoFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PdfFilename",
                table: "Videos",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ThumbnailUrl",
                table: "Videos",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ParentId",
                table: "VideoComments",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DateOfBirth",
                table: "Users",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Grade",
                table: "Users",
                type: "TEXT",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LastActivity",
                table: "Users",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastLoginAt",
                table: "Users",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "School",
                table: "Users",
                type: "TEXT",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StudentCode",
                table: "Users",
                type: "TEXT",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CourseId",
                table: "TofasTests",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "GoldenEvery",
                table: "InteractiveQuizzes",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "McqPerStage",
                table: "InteractiveQuizzes",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "QuestionsPerStage",
                table: "InteractiveQuizzes",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "StageCount",
                table: "InteractiveQuizzes",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TfPerStage",
                table: "InteractiveQuizzes",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TimerDuration",
                table: "InteractiveQuizzes",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "TimerEnabled",
                table: "InteractiveQuizzes",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "CommentReactions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    CommentId = table.Column<int>(type: "INTEGER", nullable: false),
                    UserId = table.Column<int>(type: "INTEGER", nullable: false),
                    Type = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CommentReactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CommentReactions_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CommentReactions_VideoComments_CommentId",
                        column: x => x.CommentId,
                        principalTable: "VideoComments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_VideoComments_ParentId",
                table: "VideoComments",
                column: "ParentId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_StudentCode",
                table: "Users",
                column: "StudentCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TofasTests_CourseId",
                table: "TofasTests",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_CommentReactions_CommentId",
                table: "CommentReactions",
                column: "CommentId");

            migrationBuilder.CreateIndex(
                name: "IX_CommentReactions_UserId",
                table: "CommentReactions",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_TofasTests_Courses_CourseId",
                table: "TofasTests",
                column: "CourseId",
                principalTable: "Courses",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_VideoComments_VideoComments_ParentId",
                table: "VideoComments",
                column: "ParentId",
                principalTable: "VideoComments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TofasTests_Courses_CourseId",
                table: "TofasTests");

            migrationBuilder.DropForeignKey(
                name: "FK_VideoComments_VideoComments_ParentId",
                table: "VideoComments");

            migrationBuilder.DropTable(
                name: "CommentReactions");

            migrationBuilder.DropIndex(
                name: "IX_VideoComments_ParentId",
                table: "VideoComments");

            migrationBuilder.DropIndex(
                name: "IX_Users_StudentCode",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_TofasTests_CourseId",
                table: "TofasTests");

            migrationBuilder.DropColumn(
                name: "PdfFilename",
                table: "Videos");

            migrationBuilder.DropColumn(
                name: "ThumbnailUrl",
                table: "Videos");

            migrationBuilder.DropColumn(
                name: "ParentId",
                table: "VideoComments");

            migrationBuilder.DropColumn(
                name: "DateOfBirth",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Grade",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "LastActivity",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "LastLoginAt",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "School",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "StudentCode",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "CourseId",
                table: "TofasTests");

            migrationBuilder.DropColumn(
                name: "GoldenEvery",
                table: "InteractiveQuizzes");

            migrationBuilder.DropColumn(
                name: "McqPerStage",
                table: "InteractiveQuizzes");

            migrationBuilder.DropColumn(
                name: "QuestionsPerStage",
                table: "InteractiveQuizzes");

            migrationBuilder.DropColumn(
                name: "StageCount",
                table: "InteractiveQuizzes");

            migrationBuilder.DropColumn(
                name: "TfPerStage",
                table: "InteractiveQuizzes");

            migrationBuilder.DropColumn(
                name: "TimerDuration",
                table: "InteractiveQuizzes");

            migrationBuilder.DropColumn(
                name: "TimerEnabled",
                table: "InteractiveQuizzes");
        }
    }
}
