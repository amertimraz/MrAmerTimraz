using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace EduPlatform.API.Migrations
{
    /// <inheritdoc />
    public partial class AddTeacherShowcase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "TeacherShowcase",
                table: "Booklets",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "TeacherSummary",
                table: "Booklets",
                type: "TEXT",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "BookletQuantityOffers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn)
                        .Annotation("Sqlite:Autoincrement", true),
                    BookletId = table.Column<int>(type: "INTEGER", nullable: false),
                    MinQuantity = table.Column<int>(type: "INTEGER", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BookletQuantityOffers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BookletQuantityOffers_Booklets_BookletId",
                        column: x => x.BookletId,
                        principalTable: "Booklets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "BookletSamplePages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn)
                        .Annotation("Sqlite:Autoincrement", true),
                    BookletId = table.Column<int>(type: "INTEGER", nullable: false),
                    PageNumber = table.Column<int>(type: "INTEGER", nullable: false),
                    ImageUrl = table.Column<string>(type: "TEXT", maxLength: 300, nullable: false),
                    SortOrder = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BookletSamplePages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BookletSamplePages_Booklets_BookletId",
                        column: x => x.BookletId,
                        principalTable: "Booklets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TeacherInquiries",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn)
                        .Annotation("Sqlite:Autoincrement", true),
                    BookletId = table.Column<int>(type: "INTEGER", nullable: true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Phone = table.Column<string>(type: "TEXT", maxLength: 11, nullable: false),
                    Governorate = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    GradeLevel = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    Subject = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    Quantity = table.Column<int>(type: "INTEGER", nullable: false),
                    Notes = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    Status = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    AdminNote = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    IpHash = table.Column<string>(type: "TEXT", maxLength: 64, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TeacherInquiries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TeacherInquiries_Booklets_BookletId",
                        column: x => x.BookletId,
                        principalTable: "Booklets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BookletQuantityOffers_BookletId_MinQuantity",
                table: "BookletQuantityOffers",
                columns: new[] { "BookletId", "MinQuantity" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BookletSamplePages_BookletId",
                table: "BookletSamplePages",
                column: "BookletId");

            migrationBuilder.CreateIndex(
                name: "IX_TeacherInquiries_BookletId",
                table: "TeacherInquiries",
                column: "BookletId");

            migrationBuilder.CreateIndex(
                name: "IX_TeacherInquiries_CreatedAt",
                table: "TeacherInquiries",
                column: "CreatedAt");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BookletQuantityOffers");

            migrationBuilder.DropTable(
                name: "BookletSamplePages");

            migrationBuilder.DropTable(
                name: "TeacherInquiries");

            migrationBuilder.DropColumn(
                name: "TeacherShowcase",
                table: "Booklets");

            migrationBuilder.DropColumn(
                name: "TeacherSummary",
                table: "Booklets");
        }
    }
}
