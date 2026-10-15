using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduPlatform.API.Migrations
{
    /// <inheritdoc />
    // Cosmetic text-only fixes to seeded review questions (answers/indexes untouched):
    // function names pasted from RTL text in reversed form ("()int" -> "int()"),
    // mangled parentheses, and a stray " (2)" suffix.
    public partial class FixReviewTextFormatting : Migration
    {
        private static readonly string[] ReversedCalls =
        {
            "int", "input", "len", "sort", "Sort", "print", "range", "reverse", "find", "search"
        };

        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            foreach (var name in ReversedCalls)
            {
                migrationBuilder.Sql(
                    $"UPDATE \"ReviewQuestions\" SET \"Text\" = REPLACE(\"Text\", '(){name}', '{name}()') WHERE \"Text\" LIKE '%(){name}%';");
                migrationBuilder.Sql(
                    $"UPDATE \"ReviewQuestions\" SET \"OptionsJson\" = REPLACE(\"OptionsJson\", '(){name}', '{name}()') WHERE \"OptionsJson\" LIKE '%(){name}%';");
            }

            migrationBuilder.Sql(
                "UPDATE \"ReviewQuestions\" SET \"Text\" = REPLACE(\"Text\", ')range(1,6', 'range(1,6)') WHERE \"Text\" LIKE '%)range(1,6%';");
            migrationBuilder.Sql(
                "UPDATE \"ReviewQuestions\" SET \"Text\" = REPLACE(\"Text\", ')for i in range(5', 'for i in range(5)') WHERE \"Text\" LIKE '%)for i in range(5%';");
            migrationBuilder.Sql(
                "UPDATE \"ReviewQuestions\" SET \"Text\" = REPLACE(\"Text\", ' (2)', '') WHERE \"Id\" IN (1001030, 1003033, 1003036);");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Formatting-only fix; nothing to restore.
        }
    }
}
