using EduPlatform.API.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduPlatform.API.Migrations
{
    /// <inheritdoc />
    [DbContext(typeof(AppDbContext))]
    [Migration("20260729130000_AddBookletViewCount")]
    public partial class AddBookletViewCount : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ViewCount",
                table: "Booklets",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ViewCount",
                table: "Booklets");
        }
    }
}
