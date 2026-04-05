using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduPlatform.API.Migrations
{
    /// <inheritdoc />
    public partial class AddUserActivityTracking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "LastLoginAt",
                table: "Users",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LastActivity",
                table: "Users",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LastLoginAt",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "LastActivity",
                table: "Users");
        }
    }
}
