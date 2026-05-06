using Microsoft.EntityFrameworkCore.Migrations;

namespace EduPlatform.API.Migrations
{
    public partial class AddEducationLevelToLibraryStudentInfo : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "EducationLevel",
                table: "LibraryStudentInfos",
                type: "TEXT",
                maxLength: 20,
                nullable: false,
                defaultValue: "secondary");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EducationLevel",
                table: "LibraryStudentInfos");
        }
    }
}
