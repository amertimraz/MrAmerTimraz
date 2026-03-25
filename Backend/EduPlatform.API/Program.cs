using System.Text;
using EduPlatform.API.Data;
using EduPlatform.API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var port = Environment.GetEnvironmentVariable("PORT") ?? "5001";
var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL") ?? "";
var connStr = builder.Configuration.GetConnectionString("DefaultConnection") ?? "";

static string ConvertPostgresUrlToConnectionString(string url)
{
    var uri = new Uri(url);
    var userInfo = uri.UserInfo.Split(':');
    return $"Host={uri.Host};Port={uri.Port};Database={uri.AbsolutePath.TrimStart('/')};Username={userInfo[0]};Password={userInfo[1]};SSL Mode=Require;Trust Server Certificate=true";
}

builder.Services.AddDbContext<AppDbContext>(options =>
{
    if (!string.IsNullOrEmpty(databaseUrl) && (databaseUrl.StartsWith("postgresql") || databaseUrl.StartsWith("postgres")))
    {
        options.UseNpgsql(ConvertPostgresUrlToConnectionString(databaseUrl));
    }
    else if (connStr.StartsWith("Data Source=", StringComparison.OrdinalIgnoreCase) || !connStr.Contains("Server="))
    {
        options.UseSqlite(connStr.Length > 0 ? connStr : "Data Source=EduPlatform.db");
    }
    else
    {
        options.UseSqlServer(connStr);
    }
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(
                    Environment.GetEnvironmentVariable("JWT_SECRET_KEY")
                    ?? builder.Configuration["Jwt:Key"]!)),
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audience"],
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ICourseService, CourseService>();
builder.Services.AddScoped<IVideoService, VideoService>();
builder.Services.AddScoped<ITestService, TestService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddHttpClient();
builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(o =>
{
    o.MultipartBodyLengthLimit = 500 * 1024 * 1024;
});
builder.WebHost.ConfigureKestrel(o =>
{
    o.Limits.MaxRequestBodySize = 500 * 1024 * 1024;
});

var envOrigins = Environment.GetEnvironmentVariable("ALLOWED_ORIGINS")?
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries) 
    ?? Array.Empty<string>();

var defaultOrigins = new[] { 
    "http://localhost:5173", 
    "http://localhost:3000", 
    "http://localhost:5174", 
    "https://mr-amer-timraz.vercel.app",
    "https://mr-amer-timraz.vercel.app/",
    "https://www.mr-amer-timraz.vercel.app",
    "https://www.mr-amer-timraz.vercel.app/"
};

var allowedOrigins = envOrigins.Concat(defaultOrigins).Distinct().ToArray();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

builder.Services.AddControllers()
    .AddJsonOptions(o =>
    {
        o.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        o.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
        o.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
        o.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var isPostgres = db.Database.IsNpgsql();

    // Helper: seed migration history for databases created via the old EnsureCreated approach
    void SeedMigrationHistory()
    {
        // Safety: only seed history if we detect that the database is NOT fresh
        // (i.e. 'Users' table exists but '__EFMigrationsHistory' might be missing)
        try
        {
            var checkUsersSql = isPostgres 
                ? "SELECT 1 FROM \"Users\" LIMIT 1;" 
                : "SELECT 1 FROM \"Users\" LIMIT 1;";
            db.Database.ExecuteSqlRaw(checkUsersSql);
        }
        catch
        {
            // Users table doesn't exist -> Fresh DB -> Let Migrate() handle everything
            return;
        }

        var knownMigrations = new[]
        {
            ("20260315084036_AddQuizUrlToLibraryItem",   "9.0.1"),
            ("20260322131337_AddInteractiveQuizResults",  "9.0.1"),
            ("20260322132816_AddLessonEnhancements",      "9.0.1"),
            ("20260322135422_FixModelMismatch",           "9.0.1"),
            ("20260322184828_AddNotificationImages",      "9.0.1"),
            ("20260323113205_AddLiveSessions",            "9.0.1"),
            ("20260323122140_AddQuizTheme",               "9.0.1"),
            ("20260324115540_AddBooklets",                "9.0.1"),
            ("20260325091256_AddAppSettings",             "9.0.1"),
            ("20260325211614_AddChallenges",              "9.0.1"),
        };
        try
        {
            var createHistorySql = isPostgres 
                ? "CREATE TABLE IF NOT EXISTS \"__EFMigrationsHistory\" (\"MigrationId\" character varying(150) NOT NULL, \"ProductVersion\" character varying(32) NOT NULL, CONSTRAINT \"PK___EFMigrationsHistory\" PRIMARY KEY (\"MigrationId\"));"
                : "CREATE TABLE IF NOT EXISTS \"__EFMigrationsHistory\" (\"MigrationId\" TEXT NOT NULL, \"ProductVersion\" TEXT NOT NULL, CONSTRAINT \"PK___EFMigrationsHistory\" PRIMARY KEY (\"MigrationId\"));";
            db.Database.ExecuteSqlRaw(createHistorySql);
        }
        catch { }

        foreach (var (migId, ver) in knownMigrations)
        {
            try
            {
                var insertSql = isPostgres
                    ? $"INSERT INTO \"__EFMigrationsHistory\" (\"MigrationId\", \"ProductVersion\") VALUES ('{migId}', '{ver}') ON CONFLICT DO NOTHING;"
                    : $"INSERT OR IGNORE INTO \"__EFMigrationsHistory\" (\"MigrationId\", \"ProductVersion\") VALUES ('{migId}', '{ver}');";
                
#pragma warning disable EF1002
                db.Database.ExecuteSqlRaw(insertSql);
#pragma warning restore EF1002
            }
            catch { }
        }
    }

    try
    {
        // For SQLite or Postgres, if we have existing tables but no migration history, 
        // we seed the history first to avoid "table already exists" errors.
        SeedMigrationHistory();
        db.Database.Migrate();
    }
    catch (Exception ex)
    {
        // If it still fails, it might be a different issue, but we've tried our best to sync.
        Console.WriteLine($"Migration error: {ex.Message}");
        if (ex.InnerException != null) Console.WriteLine($"Inner: {ex.InnerException.Message}");
        
        // Final attempt: just try to migrate, maybe the error was transient
        try { db.Database.Migrate(); } catch { }
    }

    // Safety-net: Ensure new columns and tables from AddLessonEnhancements exist.
    // These may not have been created if the migration was marked as applied
    // but its SQL was never actually executed (EnsureCreated legacy scenario).
    if (isPostgres)
    {
        var safetyAlters = new[]
        {
            "ALTER TABLE \"Videos\" ADD COLUMN IF NOT EXISTS \"Slug\" TEXT NOT NULL DEFAULT ''",
            "ALTER TABLE \"Videos\" ADD COLUMN IF NOT EXISTS \"PdfUrl\" TEXT",
            """
            CREATE TABLE IF NOT EXISTS "VideoComments" (
                "Id" SERIAL PRIMARY KEY,
                "VideoId" INTEGER NOT NULL REFERENCES "Videos"("Id") ON DELETE CASCADE,
                "StudentId" INTEGER NOT NULL REFERENCES "Users"("Id") ON DELETE CASCADE,
                "Content" TEXT NOT NULL,
                "CreatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
            )
            """,
            "CREATE INDEX IF NOT EXISTS \"IX_VideoComments_VideoId\" ON \"VideoComments\"(\"VideoId\")",
            "CREATE INDEX IF NOT EXISTS \"IX_VideoComments_StudentId\" ON \"VideoComments\"(\"StudentId\")",
            """
            CREATE TABLE IF NOT EXISTS "LiveSessions" (
                "Id" SERIAL PRIMARY KEY,
                "Title" VARCHAR(200) NOT NULL,
                "Description" TEXT,
                "ScheduledAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
                "JoinUrl" TEXT NOT NULL,
                "Price" DECIMAL(18,2) NOT NULL DEFAULT 0,
                "IsActive" BOOLEAN NOT NULL DEFAULT TRUE,
                "CreatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS "LiveSessionEnrollments" (
                "Id" SERIAL PRIMARY KEY,
                "LiveSessionId" INTEGER NOT NULL REFERENCES "LiveSessions"("Id") ON DELETE CASCADE,
                "StudentId" INTEGER NOT NULL REFERENCES "Users"("Id") ON DELETE CASCADE,
                "EnrolledAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
            )
            """,
            "CREATE UNIQUE INDEX IF NOT EXISTS \"IX_LiveSessionEnrollments_StudentId_LiveSessionId\" ON \"LiveSessionEnrollments\"(\"StudentId\", \"LiveSessionId\")",
            "ALTER TABLE \"PaymentRequests\" ADD COLUMN IF NOT EXISTS \"LiveSessionId\" INTEGER REFERENCES \"LiveSessions\"(\"Id\") ON DELETE CASCADE",
            "ALTER TABLE \"LibraryItems\" ADD COLUMN IF NOT EXISTS \"DownloadCount\" INTEGER NOT NULL DEFAULT 0",
            "ALTER TABLE \"LibraryItems\" ADD COLUMN IF NOT EXISTS \"ViewCount\" INTEGER NOT NULL DEFAULT 0",
            "ALTER TABLE \"InteractiveQuizzes\" ADD COLUMN IF NOT EXISTS \"AllowSkipWithoutRegistration\" BOOLEAN NOT NULL DEFAULT FALSE",
            "ALTER TABLE \"InteractiveQuizzes\" ADD COLUMN IF NOT EXISTS \"Theme\" TEXT",
            """
            CREATE TABLE IF NOT EXISTS "InteractiveQuizResults" (
                "Id" SERIAL PRIMARY KEY,
                "QuizId" INTEGER NOT NULL REFERENCES "InteractiveQuizzes"("Id") ON DELETE CASCADE,
                "SessionId" VARCHAR(100) NOT NULL,
                "PlayerName" VARCHAR(100) NOT NULL,
                "Score" INTEGER NOT NULL,
                "CorrectCount" INTEGER NOT NULL,
                "TotalCount" INTEGER NOT NULL,
                "Percentage" DOUBLE PRECISION NOT NULL,
                "CompletedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL
            )
            """,
            "CREATE UNIQUE INDEX IF NOT EXISTS \"IX_InteractiveQuizResults_QuizId_SessionId\" ON \"InteractiveQuizResults\"(\"QuizId\", \"SessionId\")",
            """
            CREATE TABLE IF NOT EXISTS "Booklets" (
                "Id" SERIAL PRIMARY KEY,
                "Title" TEXT NOT NULL,
                "Description" TEXT,
                "PdfUrl" TEXT NOT NULL,
                "CoverImageUrl" TEXT,
                "Subject" TEXT,
                "GradeLevel" TEXT,
                "Price" DECIMAL(18,2) NOT NULL,
                "IsPublished" BOOLEAN NOT NULL DEFAULT TRUE,
                "CreatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
            )
            """,
            "ALTER TABLE \"PaymentRequests\" ADD COLUMN IF NOT EXISTS \"BookletId\" INTEGER REFERENCES \"Booklets\"(\"Id\") ON DELETE CASCADE",
            // Fix boolean types if they were created as integers by SQLite-based migrations
            "ALTER TABLE \"Booklets\" ALTER COLUMN \"IsPublished\" TYPE boolean USING (\"IsPublished\"::integer::boolean)",
            "ALTER TABLE \"LiveSessions\" ALTER COLUMN \"IsActive\" TYPE boolean USING (\"IsActive\"::integer::boolean)",
            "ALTER TABLE \"InteractiveQuizzes\" ALTER COLUMN \"AllowSkipWithoutRegistration\" TYPE boolean USING (\"AllowSkipWithoutRegistration\"::integer::boolean)",
            "ALTER TABLE \"InteractiveQuizzes\" ALTER COLUMN \"ShowSupportButton\" TYPE boolean USING (\"ShowSupportButton\"::integer::boolean)",

            // Fix Id columns that might have been created as plain integers by SQLite-based migrations
            "CREATE SEQUENCE IF NOT EXISTS \"Booklets_Id_seq\"",
            "ALTER TABLE \"Booklets\" ALTER COLUMN \"Id\" SET DEFAULT nextval('\"Booklets_Id_seq\"')",
            "SELECT setval('\"Booklets_Id_seq\"', COALESCE(MAX(\"Id\"), 0) + 1, false) FROM \"Booklets\"",
            
            // Fix Column Types that might have been created as TEXT/INTEGER by SQLite-based migrations
            "ALTER TABLE \"Booklets\" ALTER COLUMN \"CreatedAt\" TYPE timestamp without time zone USING \"CreatedAt\"::timestamp without time zone",
            "ALTER TABLE \"Booklets\" ALTER COLUMN \"Price\" TYPE numeric USING \"Price\"::numeric",
            "ALTER TABLE \"LiveSessions\" ALTER COLUMN \"ScheduledAt\" TYPE timestamp without time zone USING \"ScheduledAt\"::timestamp without time zone",
            "ALTER TABLE \"LiveSessions\" ALTER COLUMN \"CreatedAt\" TYPE timestamp without time zone USING \"CreatedAt\"::timestamp without time zone",
            "ALTER TABLE \"LiveSessions\" ALTER COLUMN \"Price\" TYPE numeric USING \"Price\"::numeric",
            "ALTER TABLE \"LiveSessionEnrollments\" ALTER COLUMN \"EnrolledAt\" TYPE timestamp without time zone USING \"EnrolledAt\"::timestamp without time zone",
            "ALTER TABLE \"InteractiveQuizzes\" ALTER COLUMN \"CreatedAt\" TYPE timestamp without time zone USING \"CreatedAt\"::timestamp without time zone",
            "ALTER TABLE \"InteractiveQuizResults\" ALTER COLUMN \"CompletedAt\" TYPE timestamp without time zone USING \"CompletedAt\"::timestamp without time zone",
            "ALTER TABLE \"PaymentRequests\" ALTER COLUMN \"AmountPaid\" TYPE numeric USING \"AmountPaid\"::numeric",
            "ALTER TABLE \"PaymentRequests\" ALTER COLUMN \"CreatedAt\" TYPE timestamp without time zone USING \"CreatedAt\"::timestamp without time zone",
            "ALTER TABLE \"PaymentRequests\" ALTER COLUMN \"ReviewedAt\" TYPE timestamp without time zone USING \"ReviewedAt\"::timestamp without time zone",
            // AppSettings table safety-net
            """
            CREATE TABLE IF NOT EXISTS "AppSettings" (
                "Id" SERIAL PRIMARY KEY,
                "Key" TEXT NOT NULL UNIQUE,
                "Value" TEXT,
                "CreatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
                "UpdatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
            )
            """,
            "CREATE INDEX IF NOT EXISTS \"IX_AppSettings_Key\" ON \"AppSettings\"(\"Key\")",
            "CREATE SEQUENCE IF NOT EXISTS \"AppSettings_Id_seq\"",
            "ALTER TABLE \"AppSettings\" ALTER COLUMN \"Id\" SET DEFAULT nextval('\"AppSettings_Id_seq\"')",
            "ALTER TABLE \"AppSettings\" ALTER COLUMN \"UpdatedAt\" TYPE timestamp without time zone USING \"UpdatedAt\"::timestamp without time zone",
        };

        foreach (var sql in safetyAlters)
        {
            try
            {
#pragma warning disable EF1002
                db.Database.ExecuteSqlRaw(sql);
#pragma warning restore EF1002
            }
            catch { }
        }

        // Try to create the unique index on Slug, but don't fail if slugs have duplicates
        try
        {
#pragma warning disable EF1002
            db.Database.ExecuteSqlRaw("""
                CREATE UNIQUE INDEX IF NOT EXISTS "IX_Videos_Slug" ON "Videos"("Slug")
                """);
#pragma warning restore EF1002
        }
        catch { }
    }

    if (isPostgres)
    {
        // Reset sequences to avoid ID conflicts after bulk imports
        var seqTables = new[] {
            "Users", "Courses", "Videos", "Tests", "Questions", "Results",
            "Enrollments", "Notifications", "PaymentRequests", "LibraryItems",
            "InteractiveQuizzes", "InteractiveQuestions", "InteractiveQuizResults",
            "VideoComments", "LiveSessions", "LiveSessionEnrollments", "Booklets", "AppSettings"
        };
        foreach (var t in seqTables)
        {
            try
            {
                var sql = $"""
                    DO $$
                    DECLARE max_id bigint; seq_name text;
                    BEGIN
                        EXECUTE 'SELECT COALESCE(MAX("Id"), 0) + 1 FROM "{t}"' INTO max_id;
                        seq_name := pg_get_serial_sequence('"{t}"', 'Id');
                        IF seq_name IS NOT NULL THEN
                            PERFORM setval(seq_name, GREATEST(max_id, 1), false);
                        ELSE
                            EXECUTE format('ALTER TABLE "{t}" ALTER COLUMN "Id" RESTART WITH %s', GREATEST(max_id, 1));
                        END IF;
                    END $$;
                    """;
#pragma warning disable EF1002
                db.Database.ExecuteSqlRaw(sql);
#pragma warning restore EF1002
            }
            catch { }
        }
    }

    await DbSeeder.SeedAsync(db);
}

app.UseCors("AllowFrontend");

app.UseExceptionHandler(appError =>
{
    appError.Run(async context =>
    {
        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/json";
        var origin = context.Request.Headers["Origin"].ToString();
        if (!string.IsNullOrEmpty(origin))
        {
            context.Response.Headers["Access-Control-Allow-Origin"] = origin;
            context.Response.Headers["Access-Control-Allow-Credentials"] = "true";
        }
        var contextFeature = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>();
        if (contextFeature != null)
        {
            await context.Response.WriteAsync(System.Text.Json.JsonSerializer.Serialize(new
            {
                statusCode = 500,
                message = "Internal Server Error",
                detailed = contextFeature.Error.Message,
                stackTrace = contextFeature.Error.ToString(),
                innerException = contextFeature.Error.InnerException?.ToString()
            }));
        }
    });
});
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        var origin = ctx.Context.Request.Headers["Origin"].ToString();
        if (!string.IsNullOrEmpty(origin))
        {
            ctx.Context.Response.Headers["Access-Control-Allow-Origin"] = origin;
            ctx.Context.Response.Headers["Access-Control-Allow-Credentials"] = "true";
            ctx.Context.Response.Headers["Vary"] = "Origin";
        }
        var path = ctx.Context.Request.Path.Value ?? "";
        if (path.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase))
        {
            ctx.Context.Response.Headers["Content-Disposition"] = "inline";
            ctx.Context.Response.Headers["Content-Type"] = "application/pdf";
            ctx.Context.Response.Headers["X-Frame-Options"] = "SAMEORIGIN";
        }
    }
});
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
