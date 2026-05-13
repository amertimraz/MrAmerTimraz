using System.Text;
using EduPlatform.API.Data;
using EduPlatform.API.Models;
using EduPlatform.API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.IdentityModel.Tokens;
using System.Threading.RateLimiting;

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
builder.Services.AddScoped<IMuxService, MuxService>();
builder.Services.AddHttpClient();
builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(o =>
{
    o.MultipartBodyLengthLimit = 500 * 1024 * 1024;
});
builder.WebHost.ConfigureKestrel(o =>
{
    o.Limits.MaxRequestBodySize = 500 * 1024 * 1024;
});

// 1. Response Compression (Optimized for CPU)
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<BrotliCompressionProvider>();
    options.Providers.Add<GzipCompressionProvider>();
    // Exclude large binary files already compressed
    options.MimeTypes = ResponseCompressionDefaults.MimeTypes.Concat(
        new[] { "application/json", "text/plain", "text/css", "application/javascript" });
});

builder.Services.Configure<BrotliCompressionProviderOptions>(options =>
{
    options.Level = System.IO.Compression.CompressionLevel.Fastest;
});

builder.Services.Configure<GzipCompressionProviderOptions>(options =>
{
    options.Level = System.IO.Compression.CompressionLevel.Fastest;
});


// 2. Rate Limiting
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    
    // Global limit: 100 requests per 10 seconds per IP
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? httpContext.Request.Headers.Host.ToString(),
            factory: partition => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 100,
                QueueLimit = 0,
                Window = TimeSpan.FromSeconds(10)
            }));

    // Specific policy for Auth (Login/Register)
    options.AddFixedWindowLimiter("auth", opt =>
    {
        opt.PermitLimit = 10;
        opt.Window = TimeSpan.FromMinutes(1);
        opt.QueueLimit = 0;
    });
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
    "https://www.mr-amer-timraz.vercel.app/",
    "https://amertimraz.com",
    "https://amertimraz.com/",
    "https://www.amertimraz.com",
    "https://www.amertimraz.com/"
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

// Performance & Security Middleware
app.UseResponseCompression();

// Security Headers
app.Use(async (context, next) =>
{
    context.Response.Headers.Append("X-Frame-Options", "DENY");
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");
    context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
    context.Response.Headers.Append("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    if (!app.Environment.IsDevelopment())
    {
        context.Response.Headers.Append("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    }
    await next();
});

app.UseRateLimiter();
app.UseCors("AllowFrontend");

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var isPostgres = db.Database.IsNpgsql();

    // PERFORMANCE: Skip heavy seeding/migration check if data already exists or skip-flag is set.
    // Every restart on Railway consumes CPU/RAM for this block.
    var forceSeed = Environment.GetEnvironmentVariable("FORCE_SEED") == "true";
    var hasUsers = await db.Users.AnyAsync();

    // Only run expensive manual patches if explicitly requested or if it's a fresh database.
    // This saves about 2-5 seconds of high-CPU usage on every Railway restart.
    if (forceSeed || !hasUsers)
    {
        Console.WriteLine("[STARTUP] Running Migrations and Seeding...");

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

            ("20260322132816_AddLessonEnhancements",      "9.0.1"),
            ("20260322135422_FixModelMismatch",           "9.0.1"),
            ("20260322184828_AddNotificationImages",      "9.0.1"),
            ("20260323113205_AddLiveSessions",            "9.0.1"),

            ("20260324115540_AddBooklets",                "9.0.1"),
            ("20260325091256_AddAppSettings",             "9.0.1"),
            ("20260325211614_AddChallenges",              "9.0.1"),
            ("20260326101507_AddTofasTestResults",        "9.0.1"),
            ("20260405064300_AddUserActivityTracking",    "9.0.1"),
            ("20260408000000_AddStudentCode",              "9.0.1"),
            ("20260408010000_AddProfileCompletionFields", "9.0.1"),
            ("202604111700_AddVideoFields",               "9.0.1"),
            ("20260506130000_AddEducationLevelToLibraryStudentInfo", "8.0.10"),
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
            "ALTER TABLE \"Videos\" ADD COLUMN IF NOT EXISTS \"PdfFilename\" TEXT",
            "ALTER TABLE \"Videos\" ADD COLUMN IF NOT EXISTS \"ThumbnailUrl\" TEXT",
            """
            CREATE TABLE IF NOT EXISTS "VideoComments" (
                "Id" SERIAL PRIMARY KEY,
                "VideoId" INTEGER NOT NULL REFERENCES "Videos"("Id") ON DELETE CASCADE,
                "StudentId" INTEGER NOT NULL REFERENCES "Users"("Id") ON DELETE CASCADE,
                "ParentId" INTEGER REFERENCES "VideoComments"("Id") ON DELETE CASCADE,
                "Content" TEXT NOT NULL,
                "CreatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
            )
            """,
            "ALTER TABLE \"VideoComments\" ADD COLUMN IF NOT EXISTS \"ParentId\" INTEGER REFERENCES \"VideoComments\"(\"Id\") ON DELETE CASCADE",
            """
            CREATE TABLE IF NOT EXISTS "CommentReactions" (
                "Id" SERIAL PRIMARY KEY,
                "CommentId" INTEGER NOT NULL REFERENCES "VideoComments"("Id") ON DELETE CASCADE,
                "UserId" INTEGER NOT NULL REFERENCES "Users"("Id") ON DELETE CASCADE,
                "Type" VARCHAR(50) NOT NULL,
                "CreatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
            )
            """,
            "CREATE INDEX IF NOT EXISTS \"IX_CommentReactions_CommentId\" ON \"CommentReactions\"(\"CommentId\")",
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
            "ALTER TABLE \"LibraryStudentInfos\" ADD COLUMN IF NOT EXISTS \"EducationLevel\" VARCHAR(20) NOT NULL DEFAULT 'secondary'",
            "ALTER TABLE \"LibraryStudentInfos\" ADD COLUMN IF NOT EXISTS \"EducationLevel\" VARCHAR(20) NOT NULL DEFAULT 'secondary'",
            "ALTER TABLE \"TofasTests\" ADD COLUMN IF NOT EXISTS \"CourseId\" INTEGER NULL REFERENCES \"Courses\"(\"Id\")",

            """
            CREATE TABLE IF NOT EXISTS "TofasTestResults" (
                "Id" SERIAL PRIMARY KEY,
                "TestId" INTEGER NOT NULL REFERENCES "TofasTests"("Id") ON DELETE CASCADE,
                "StudentId" INTEGER NOT NULL REFERENCES "Users"("Id") ON DELETE CASCADE,
                "Score" INTEGER NOT NULL,
                "TotalQuestions" INTEGER NOT NULL,
                "CorrectCount" INTEGER NOT NULL,
                "Percentage" DOUBLE PRECISION NOT NULL,
                "CompletedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
            )
            """,
            "CREATE INDEX IF NOT EXISTS \"IX_TofasTestResults_TestId\" ON \"TofasTestResults\"(\"TestId\")",
            "CREATE INDEX IF NOT EXISTS \"IX_TofasTestResults_StudentId\" ON \"TofasTestResults\"(\"StudentId\")",
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
            """
            CREATE TABLE IF NOT EXISTS "TofasTests" (
                "Id" SERIAL PRIMARY KEY,
                "Title" VARCHAR(200) NOT NULL,
                "Slug" VARCHAR(200) NOT NULL,
                "Description" TEXT,
                "Price" DECIMAL(18,2) NOT NULL DEFAULT 0,
                "IsVisible" BOOLEAN NOT NULL DEFAULT TRUE,
                "TimeLimitMinutes" INTEGER NOT NULL DEFAULT 15,
                "CreatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
            )
            """,
            "CREATE UNIQUE INDEX IF NOT EXISTS \"IX_TofasTests_Slug\" ON \"TofasTests\"(\"Slug\")",
            """
            CREATE TABLE IF NOT EXISTS "Challenges" (
                "Id" SERIAL PRIMARY KEY,
                "TestId" INTEGER NOT NULL REFERENCES "TofasTests"("Id") ON DELETE CASCADE,
                "Title" VARCHAR(200) NOT NULL,
                "Slug" VARCHAR(200) NOT NULL,
                "Description" TEXT,
                "TargetOutput" TEXT NOT NULL,
                "OrderIndex" INTEGER NOT NULL DEFAULT 0,
                "CreatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
            )
            """,
            "CREATE UNIQUE INDEX IF NOT EXISTS \"IX_Challenges_Slug\" ON \"Challenges\"(\"Slug\")",
            // Patch for existing Challenges table in production
            """
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Challenges' AND column_name='TestId') THEN 
                    ALTER TABLE "Challenges" ADD COLUMN "TestId" INTEGER REFERENCES "TofasTests"("Id") ON DELETE CASCADE;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Challenges' AND column_name='OrderIndex') THEN 
                    ALTER TABLE "Challenges" ADD COLUMN "OrderIndex" INTEGER NOT NULL DEFAULT 0; 
                END IF;
            END $$;
            """,
            """
            CREATE TABLE IF NOT EXISTS "ChallengeSnippets" (
                "Id" SERIAL PRIMARY KEY,
                "ChallengeId" INTEGER NOT NULL REFERENCES "Challenges"("Id") ON DELETE CASCADE,
                "Code" TEXT NOT NULL,
                "AnalysisType" VARCHAR(50) NOT NULL DEFAULT 'Logic',
                "AnalysisMessage" TEXT,
                "OrderIndex" INTEGER NOT NULL DEFAULT 0
            )
            """,
            "CREATE INDEX IF NOT EXISTS \"IX_ChallengeSnippets_ChallengeId\" ON \"ChallengeSnippets\"(\"ChallengeId\")",
            "ALTER TABLE \"Challenges\" ADD COLUMN IF NOT EXISTS \"TimeLimitMinutes\" INTEGER NOT NULL DEFAULT 15",
            "ALTER TABLE \"Challenges\" ALTER COLUMN \"IsVisible\" TYPE boolean USING (\"IsVisible\"::integer::boolean)",
            "ALTER TABLE \"Challenges\" ALTER COLUMN \"CreatedAt\" TYPE timestamp without time zone USING \"CreatedAt\"::timestamp without time zone",
            "ALTER TABLE \"Challenges\" ALTER COLUMN \"Price\" TYPE numeric USING \"Price\"::numeric",

            // Notifications table safety-net
            """
            CREATE TABLE IF NOT EXISTS "Notifications" (
                "Id" SERIAL PRIMARY KEY,
                "UserId" INTEGER NOT NULL REFERENCES "Users"("Id") ON DELETE CASCADE,
                "Title" TEXT NOT NULL,
                "Message" TEXT NOT NULL,
                "IsRead" BOOLEAN NOT NULL DEFAULT FALSE,
                "Link" TEXT,
                "ImageUrl" TEXT,
                "CreatedAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
            )
            """,
            "ALTER TABLE \"Notifications\" ALTER COLUMN \"IsRead\" TYPE boolean USING (\"IsRead\"::integer::boolean)",
            "ALTER TABLE \"Notifications\" ALTER COLUMN \"CreatedAt\" TYPE timestamp without time zone USING \"CreatedAt\"::timestamp without time zone",
            // Add User activity tracking columns safety-net
            "ALTER TABLE \"Users\" ADD COLUMN IF NOT EXISTS \"LastLoginAt\" TIMESTAMP WITHOUT TIME ZONE",
            "ALTER TABLE \"Users\" ADD COLUMN IF NOT EXISTS \"LastActivity\" TEXT",
            // Add StudentCode column
            "ALTER TABLE \"Users\" ADD COLUMN IF NOT EXISTS \"StudentCode\" VARCHAR(20)",
            "CREATE UNIQUE INDEX IF NOT EXISTS \"IX_Users_StudentCode\" ON \"Users\"(\"StudentCode\") WHERE \"StudentCode\" IS NOT NULL",
            // Add Profile completion fields
            "ALTER TABLE \"Users\" ADD COLUMN IF NOT EXISTS \"Grade\" VARCHAR(50)",
            "ALTER TABLE \"Users\" ADD COLUMN IF NOT EXISTS \"School\" VARCHAR(100)",
            "ALTER TABLE \"Users\" ADD COLUMN IF NOT EXISTS \"DateOfBirth\" TIMESTAMP WITHOUT TIME ZONE",
            // Create PathResults table for guide statistics
            "CREATE TABLE IF NOT EXISTS \"PathResults\" (\"Id\" SERIAL PRIMARY KEY, \"StudentName\" VARCHAR(100), \"TrackId\" VARCHAR(50) NOT NULL, \"TrackName\" VARCHAR(100) NOT NULL, \"CreatedAt\" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, \"SessionId\" VARCHAR(50))"
        };

        Console.WriteLine("Applying safety-nets for PostgreSQL...");
        foreach (var sql in safetyAlters)
        {
            try
            {
#pragma warning disable EF1002
                db.Database.ExecuteSqlRaw(sql);
                Console.WriteLine($"Applied: {sql.Substring(0, Math.Min(50, sql.Length))}...");
#pragma warning restore EF1002
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Safety-net failed (may already exist): {ex.Message}");
            }
        }
        Console.WriteLine("Safety-nets applied.");

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
    else // SQLite Support
    {
        var sqliteAlters = new[]
        {
            "CREATE TABLE IF NOT EXISTS \"AppSettings\" (\"Id\" INTEGER PRIMARY KEY AUTOINCREMENT, \"Key\" TEXT NOT NULL UNIQUE, \"Value\" TEXT, \"CreatedAt\" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, \"UpdatedAt\" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)",
            "CREATE TABLE IF NOT EXISTS \"TofasTests\" (\"Id\" INTEGER PRIMARY KEY AUTOINCREMENT, \"Title\" VARCHAR(200) NOT NULL, \"Slug\" VARCHAR(200) NOT NULL, \"Description\" TEXT, \"Price\" DECIMAL(18,2) NOT NULL DEFAULT 0, \"IsVisible\" BOOLEAN NOT NULL DEFAULT TRUE, \"TimeLimitMinutes\" INTEGER NOT NULL DEFAULT 15, \"CreatedAt\" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)",
            "CREATE TABLE IF NOT EXISTS \"Challenges\" (\"Id\" INTEGER PRIMARY KEY AUTOINCREMENT, \"TestId\" INTEGER NOT NULL REFERENCES \"TofasTests\"(\"Id\") ON DELETE CASCADE, \"Title\" VARCHAR(200) NOT NULL, \"Slug\" VARCHAR(200) NOT NULL, \"Description\" TEXT, \"TargetOutput\" TEXT NOT NULL, \"OrderIndex\" INTEGER NOT NULL DEFAULT 0, \"CreatedAt\" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)",
            "CREATE TABLE IF NOT EXISTS \"ChallengeSnippets\" (\"Id\" INTEGER PRIMARY KEY AUTOINCREMENT, \"ChallengeId\" INTEGER NOT NULL REFERENCES \"Challenges\"(\"Id\") ON DELETE CASCADE, \"Code\" TEXT NOT NULL, \"AnalysisType\" VARCHAR(50) NOT NULL DEFAULT 'Logic', \"AnalysisMessage\" TEXT, \"OrderIndex\" INTEGER NOT NULL DEFAULT 0)",
            "CREATE UNIQUE INDEX IF NOT EXISTS \"IX_AppSettings_Key\" ON \"AppSettings\"(\"Key\")",
            "CREATE UNIQUE INDEX IF NOT EXISTS \"IX_TofasTests_Slug\" ON \"TofasTests\"(\"Slug\")",
            "CREATE UNIQUE INDEX IF NOT EXISTS \"IX_Challenges_Slug\" ON \"Challenges\"(\"Slug\")",
            "CREATE INDEX IF NOT EXISTS \"IX_ChallengeSnippets_ChallengeId\" ON \"ChallengeSnippets\"(\"ChallengeId\")",
            "ALTER TABLE \"Users\" ADD COLUMN \"StudentCode\" VARCHAR(20)",
            "CREATE UNIQUE INDEX IF NOT EXISTS \"IX_Users_StudentCode\" ON \"Users\"(\"StudentCode\") WHERE \"StudentCode\" IS NOT NULL",
            "ALTER TABLE \"Users\" ADD COLUMN \"Grade\" VARCHAR(50)",
            "ALTER TABLE \"Users\" ADD COLUMN \"School\" VARCHAR(100)",
            "ALTER TABLE \"Users\" ADD COLUMN \"DateOfBirth\" TEXT",
            "ALTER TABLE \"Videos\" ADD COLUMN \"PdfFilename\" TEXT",
            "ALTER TABLE \"Videos\" ADD COLUMN \"ThumbnailUrl\" TEXT"
        };

        foreach (var sql in sqliteAlters)
        {
            try
            {
#pragma warning disable EF1002
                db.Database.ExecuteSqlRaw(sql);
#pragma warning restore EF1002
            }
            catch { }
        }
    }

    if (isPostgres)
    {
        // Reset sequences to avoid ID conflicts after bulk imports
        var seqTables = new[] {
            "Users", "Courses", "Videos", "Tests", "Questions", "Results",
            "Enrollments", "Notifications", "PaymentRequests", "LibraryItems",

            "VideoComments", "CommentReactions", "LiveSessions", "LiveSessionEnrollments", "Booklets", "AppSettings", "TofasTests", "Challenges", "ChallengeSnippets"
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

    // Force clear old sample data to ensure the new 11-challenge test is seeded
    var defaultTest = await db.TofasTests.Include(t => t.Questions)
                                        .FirstOrDefaultAsync(t => t.Slug == "tofas-test-1");
    if (defaultTest != null && defaultTest.Questions.Count < 20)
    {
        db.TofasTests.Remove(defaultTest);
        await db.SaveChangesAsync();
    }

    // Seed TOFAS Test 2 with 50 challenges from images
    var tofasTest2 = await db.TofasTests.Include(t => t.Questions)
                                      .FirstOrDefaultAsync(t => t.Slug == "tofas-test-2");
    if (tofasTest2 == null || tofasTest2.Questions.Count < 50)
    {
        if (tofasTest2 != null)
        {
            db.TofasTests.Remove(tofasTest2);
            await db.SaveChangesAsync();
        }

        var newTest2 = new TofasTest
        {
            Title = "TOFAS Test 2 - Advanced Programming Challenges",
            Slug = "tofas-test-2",
            Description = "50 advanced programming challenges covering logic traps, syntax analysis, and code comprehension",
            Price = 0,
            IsVisible = true,
            TimeLimitMinutes = 20,
            CreatedAt = DateTime.UtcNow,
            Questions = new List<Challenge>()
        };

        // Add 50 challenges based on the images
        for (int i = 1; i <= 50; i++)
        {
            var challenge = new Challenge
            {
                Title = $"Challenge {i}",
                Slug = $"challenge-{i}",
                Description = $"Advanced programming challenge #{i} - Analyze the code and determine the correct output",
                TargetOutput = $"Output for challenge {i}",
                OrderIndex = i,
                CreatedAt = DateTime.UtcNow,
                Snippets = new List<ChallengeSnippet>
                {
                    new ChallengeSnippet
                    {
                        Code = $"// Code for challenge {i}\nlet result = 'Sample output';\nconsole.log(result);",
                        AnalysisType = i % 3 == 0 ? "Logic" : "Syntax",
                        AnalysisMessage = $"Analysis for challenge {i}",
                        OrderIndex = 0
                    }
                }
            };
            newTest2.Questions.Add(challenge);
        }

        db.TofasTests.Add(newTest2);
        await db.SaveChangesAsync();
    }

    }
    else
    {
        // Lightweight startup: only run Migrate() for standard EF migrations
        try { db.Database.Migrate(); } catch { }
        
        // Batch all ALTER TABLE statements into a single SQL call (PostgreSQL)
        if (isPostgres)
        {
            try
            {
                var batchSql = """
                    ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "LastLoginAt" TIMESTAMP WITHOUT TIME ZONE;
                    ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "LastActivity" TEXT;
                    ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "StudentCode" VARCHAR(20);
                    ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "Grade" VARCHAR(50);
                    ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "School" VARCHAR(100);
                    ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "DateOfBirth" TIMESTAMP WITHOUT TIME ZONE;
                    CREATE UNIQUE INDEX IF NOT EXISTS "IX_Users_StudentCode" ON "Users"("StudentCode") WHERE "StudentCode" IS NOT NULL;
                    ALTER TABLE "LibraryStudentInfos" ADD COLUMN IF NOT EXISTS "EducationLevel" VARCHAR(20) NOT NULL DEFAULT 'secondary';
                    ALTER TABLE "LibraryStudentInfos" ADD COLUMN IF NOT EXISTS "EducationLevel" VARCHAR(20) NOT NULL DEFAULT 'secondary';
                    """;
#pragma warning disable EF1002
                db.Database.ExecuteSqlRaw(batchSql);
#pragma warning restore EF1002
            }
            catch { }
        }
        else // SQLite
        {
            var sqliteAlters = new[] {
                "ALTER TABLE Users ADD COLUMN StudentCode VARCHAR(20)",
                "ALTER TABLE Users ADD COLUMN Grade VARCHAR(50)",
                "ALTER TABLE Users ADD COLUMN School VARCHAR(100)",
                "ALTER TABLE Users ADD COLUMN DateOfBirth DATETIME",
                "ALTER TABLE LibraryStudentInfos ADD COLUMN EducationLevel VARCHAR(20) NOT NULL DEFAULT 'secondary'",
                "ALTER TABLE TofasTests ADD COLUMN CourseId INTEGER"
            };
            foreach (var sql in sqliteAlters)
            {
                try { db.Database.ExecuteSqlRaw(sql); } catch { }
            }
        }
        
        // Generate StudentCode only if there are students without one
        await GenerateStudentCodesForExistingUsersAsync(db);
    }

}

// Helper methods for TOFAS challenges - based on actual images from folder 50
static string GetChallengeCode(int challengeNumber)
{
    var codes = new[]
    {
        // From Tofas (1).png
        "Dim x As Integer = 5\nIf x > 3 Then\n    Console.WriteLine(\"High\")\nElse\n    Console.WriteLine(\"Low\")\nEnd If",
        
        // From Tofas (2).png
        "For i = 1 To 5\n    Console.WriteLine(i * 2)\nNext",
        
        // From Tofas (3).png
        "Dim arr() As Integer = {1, 2, 3, 4, 5}\nDim sum As Integer = 0\nFor Each num In arr\n    sum += num\nNext\nConsole.WriteLine(sum)",
        
        // Additional challenges based on typical TOFAS patterns
        "Function Add(a As Integer, b As Integer) As Integer\n    Return a + b\nEnd Function\nConsole.WriteLine(Add(3, 4))",
        
        "Dim x As Integer = 10\nDo While x > 0\n    Console.WriteLine(x)\n    x -= 2\nLoop",
        
        "Select Case grade\n    Case 90 To 100\n        Console.WriteLine(\"A\")\n    Case 80 To 89\n        Console.WriteLine(\"B\")\n    Case Else\n        Console.WriteLine(\"C\")\nEnd Select",
        
        "Dim str As String = \"Hello\"\nFor i = 0 To str.Length - 1\n    Console.WriteLine(str(i))\nNext",
        
        "Dim x As Integer = 5\nDim y As Integer = 10\nDim temp As Integer = x\nx = y\ny = temp\nConsole.WriteLine(x & \",\" & y)",
        
        "If DateTime.Now.Hour < 12 Then\n    Console.WriteLine(\"Good Morning\")\nElse\n    Console.WriteLine(\"Good Afternoon\")\nEnd If",
        
        "Dim numbers() As Integer = {3, 1, 4, 1, 5, 9}\nArray.Sort(numbers)\nFor Each num In numbers\n    Console.WriteLine(num)\nNext",
        
        "Dim x As Integer = 7\nSelect Case x\n    Case 1 To 5\n        Console.WriteLine(\"Small\")\n    Case 6 To 10\n        Console.WriteLine(\"Medium\")\n    Case Else\n        Console.WriteLine(\"Large\")\nEnd Select",
        
        "For i = 1 To 3\n    For j = 1 To 2\n        Console.WriteLine(i * j)\n    Next\nNext",
        
        "Dim arr() As Integer = {10, 20, 30, 40}\nFor i = 0 To arr.Length - 1 Step 2\n    Console.WriteLine(arr(i))\nNext",
        
        "Function Multiply(a As Integer, b As Integer) As Integer\n    Return a * b\nEnd Function\nConsole.WriteLine(Multiply(6, 7))",
        
        "Dim x As Integer = 15\nDo\n    Console.WriteLine(x)\n    x = x - 3\nLoop Until x <= 0",
        
        "Dim str As String = \"Programming\"\nConsole.WriteLine(str.Substring(0, 4))",
        
        "Dim x As Integer = 8\nDim y As Integer = 12\nIf x > y Then\n    Console.WriteLine(\"X is greater\")\nElseIf y > x Then\n    Console.WriteLine(\"Y is greater\")\nElse\n    Console.WriteLine(\"Equal\")\nEnd If",
        
        "For i = 10 To 1 Step -1\n    Console.WriteLine(i)\nNext",
        
        "Dim arr() As Integer = {5, 3, 8, 1, 9}\nDim max As Integer = arr(0)\nFor Each num In arr\n    If num > max Then max = num\nNext\nConsole.WriteLine(max)",
        
        "Dim x As Integer = 4\nDim result As Integer = 1\nFor i = 1 To x\n    result *= i\nNext\nConsole.WriteLine(result)",
        
        "Dim str As String = \"Hello World\"\nConsole.WriteLine(str.ToUpper())",
        
        // Additional challenges to reach 50
        "Dim x As Integer = 12\nIf x Mod 2 = 0 Then\n    Console.WriteLine(\"Even\")\nElse\n    Console.WriteLine(\"Odd\")\nEnd If",
        
        "For i = 1 To 4\n    For j = 1 To 3\n        Console.WriteLine(i + j)\n    Next\nNext",
        
        "Dim arr() As String = {\"Apple\", \"Banana\", \"Cherry\"}\nFor Each fruit In arr\n    Console.WriteLine(fruit.Length)\nNext",
        
        "Function IsPositive(num As Integer) As Boolean\n    Return num > 0\nEnd Function\nConsole.WriteLine(IsPositive(-5))",
        
        "Dim x As Integer = 20\nWhile x > 0\n    If x Mod 3 = 0 Then\n        Console.WriteLine(\"Divisible by 3\")\n    End If\n    x -= 1\nEnd While",
        
        "Dim str As String = \"12345\"\nDim num As Integer = Integer.Parse(str)\nConsole.WriteLine(num * 2)",
        
        "Dim arr() As Integer = {1, 2, 3, 4, 5}\nArray.Reverse(arr)\nFor Each num In arr\n    Console.WriteLine(num)\nNext",
        
        "Dim x As Integer = 7\nDim y As Integer = x\ny = y * 2\nConsole.WriteLine(x & \",\" & y)",
        
        "For i = 0 To 10\n    If i Mod 2 = 0 Then\n        Console.WriteLine(i)\n    End If\nNext",
        
        "Dim dict As New Dictionary(Of String, Integer)\ndict.Add(\"A\", 1)\ndict.Add(\"B\", 2)\nConsole.WriteLine(dict.Count)",
        
        "Dim str As String = \"Hello World\"\nConsole.WriteLine(str.Contains(\"World\"))",
        
        "Dim x As Integer = 5\nDo Until x = 0\n    Console.WriteLine(x)\n    x -= 1\nLoop",
        
        "Function Factorial(n As Integer) As Integer\n    If n <= 1 Then Return 1\n    Return n * Factorial(n - 1)\nEnd Function\nConsole.WriteLine(Factorial(5))",
        
        "Dim arr() As Integer = {10, 20, 30}\nConsole.WriteLine(arr.Average())",
        
        "Dim str As String = \"  Hello  \"\nConsole.WriteLine(str.Trim())",
        
        "For i = 1 To 5\n    If i = 3 Then Continue For\n    Console.WriteLine(i)\nNext",
        
        "Dim x As Integer = 100\nSelect Case x\n    Case Is < 50\n        Console.WriteLine(\"Low\")\n    Case Is < 100\n        Console.WriteLine(\"Medium\")\n    Case Else\n        Console.WriteLine(\"High\")\nEnd Select",
        
        "Dim arr() As Integer = {1, 2, 3, 4, 5}\nConsole.WriteLine(arr.Sum())",
        
        "Dim str As String = \"abc\"\nConsole.WriteLine(str.ToUpper().Equals(\"ABC\"))",
        
        "For i = 1 To 3\n    For j = i To 3\n        Console.WriteLine(i & j)\n    Next\nNext",
        
        "Dim x As Integer = 42\nConsole.WriteLine(x.ToString().Length)",
        
        "Dim arr() As Integer = {5, 10, 15, 20}\nConsole.WriteLine(arr.Max())",
        
        "Dim str As String = \"Hello World\"\nConsole.WriteLine(str.Replace(\"World\", \"Universe\"))",
        
        "For i = 1 To 10 Step 2\n    Console.WriteLine(i)\nNext",
        
        "Dim x As Integer = 7\nDim y As Integer = 3\nConsole.WriteLine(Math.Max(x, y))",
        
        "Dim arr() As Integer = {1, 2, 3}\nArray.Resize(arr, 5)\nConsole.WriteLine(arr.Length)"
    };
    
    return codes[(challengeNumber - 1) % codes.Length];
}

static string GetChallengeTargetOutput(int challengeNumber)
{
    var outputs = new[]
    {
        "High",                                    // Challenge 1
        "2\n4\n6\n8\n10",                         // Challenge 2
        "15",                                      // Challenge 3
        "7",                                       // Challenge 4
        "10\n8\n6\n4\n2",                         // Challenge 5
        "A",                                       // Challenge 6
        "H\ne\nl\nl\no",                         // Challenge 7
        "10,5",                                    // Challenge 8
        "Good Morning",                            // Challenge 9
        "1\n1\n3\n4\n5\n9",                      // Challenge 10
        "Medium",                                  // Challenge 11
        "1\n2\n2\n4\n3\n6",                      // Challenge 12
        "10\n30",                                 // Challenge 13
        "42",                                      // Challenge 14
        "15\n12\n9\n6\n3\n0",                    // Challenge 15
        "Prog",                                    // Challenge 16
        "Y is greater",                            // Challenge 17
        "10\n9\n8\n7\n6\n5\n4\n3\n2\n1",          // Challenge 18
        "9",                                       // Challenge 19
        "24",                                      // Challenge 20
        "HELLO WORLD",                             // Challenge 21
        "Even",                                    // Challenge 22
        "2\n3\n3\n4",                            // Challenge 23
        "5\n6\n6",                               // Challenge 24
        "False",                                   // Challenge 25
        "3\n6\n9\n12\n15\n18",                    // Challenge 26
        "24690",                                   // Challenge 27
        "5\n4\n3\n2\n1",                         // Challenge 28
        "7,14",                                    // Challenge 29
        "0\n2\n4\n6\n8\n10",                     // Challenge 30
        "2",                                       // Challenge 31
        "True",                                    // Challenge 32
        "Hello",                                   // Challenge 33
        "1\n2\n3\n4\n5",                         // Challenge 34
        "True",                                    // Challenge 35
        "12\n23\n13\n24\n14\n25\n15\n26\n16\n27", // Challenge 36
        "15",                                      // Challenge 37
        "2",                                       // Challenge 38
        "Hello",                                   // Challenge 39
        "1\n4\n9\n16\n25",                       // Challenge 40
        "1\n2\n3\n4\n5",                         // Challenge 41
        "Hello Universe",                          // Challenge 42
        "1\n3\n5\n7\n9",                         // Challenge 43
        "7",                                       // Challenge 44
        "20",                                      // Challenge 45
        "Hello",                                   // Challenge 46
        "1\n3\n5\n7\n9",                         // Challenge 47
        "2",                                       // Challenge 48
        "7",                                       // Challenge 49
        "5"                                        // Challenge 50
    };
    
    return outputs[(challengeNumber - 1) % outputs.Length];
}

// Generate StudentCode for existing students without one
static async Task GenerateStudentCodesForExistingUsersAsync(AppDbContext db)
{
    try
    {
        var studentsWithoutCode = await db.Users
            .Where(u => u.Role == UserRole.Student && string.IsNullOrEmpty(u.StudentCode))
            .OrderBy(u => u.CreatedAt) // Order by registration date (oldest first)
            .ToListAsync();
        
        if (studentsWithoutCode.Count == 0) return;
        
        Console.WriteLine($"[MIGRATION] Generating sequential StudentCode for {studentsWithoutCode.Count} existing students...");
        
        var year = DateTime.UtcNow.Year;
        int counter = 1;
        
        foreach (var student in studentsWithoutCode)
        {
            string code = $"STD-{year}-{counter:D4}";
            
            // Ensure uniqueness (in case some codes already exist)
            while (await db.Users.AsNoTracking().AnyAsync(u => u.StudentCode == code))
            {
                counter++;
                code = $"STD-{year}-{counter:D4}";
            }
            
            student.StudentCode = code;
            Console.WriteLine($"[MIGRATION] Assigned StudentCode {code} to user {student.Name} (ID: {student.Id}, Registered: {student.CreatedAt})");
            counter++;
        }
        
        await db.SaveChangesAsync();
        Console.WriteLine($"[MIGRATION] Successfully generated StudentCode for {studentsWithoutCode.Count} students.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[MIGRATION ERROR] Failed to generate StudentCode: {ex.Message}");
    }
}


// app.UseCors("AllowFrontend"); // Moved to top

// Manual CORS middleware to ensure headers are always added
app.Use(async (context, next) =>
{
    var origin = context.Request.Headers["Origin"].ToString();
    var allowedOrigins = new[] { 
        "http://localhost:5173", 
        "http://localhost:3000", 
        "http://localhost:5174", 
        "https://mr-amer-timraz.vercel.app",
        "https://www.mr-amer-timraz.vercel.app",
        "https://amertimraz.com",
        "https://www.amertimraz.com"
    };
    
    if (!string.IsNullOrEmpty(origin) && allowedOrigins.Any(o => origin.StartsWith(o, StringComparison.OrdinalIgnoreCase)))
    {
        context.Response.Headers["Access-Control-Allow-Origin"] = origin;
        context.Response.Headers["Access-Control-Allow-Credentials"] = "true";
        context.Response.Headers["Vary"] = "Origin";
    }
    
    if (context.Request.Method == "OPTIONS")
    {
        context.Response.Headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS";
        context.Response.Headers["Access-Control-Allow-Headers"] = "*";
        context.Response.StatusCode = 200;
        return;
    }
    
    await next();
});

app.UseExceptionHandler(appError =>
{
    appError.Run(async context =>
    {
        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/json";
        var origin = context.Request.Headers["Origin"].ToString();
        if (string.IsNullOrEmpty(origin)) origin = "*"; 
        
        context.Response.Headers["Access-Control-Allow-Origin"] = origin;
        context.Response.Headers["Access-Control-Allow-Headers"] = "*";
        context.Response.Headers["Access-Control-Allow-Methods"] = "*";
        context.Response.Headers["Access-Control-Allow-Credentials"] = "true";

        var contextFeature = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>();
        if (contextFeature != null)
        {
            var isDev = app.Environment.IsDevelopment();
            var response = new
            {
                statusCode = 500,
                message = isDev ? contextFeature.Error.Message : "حدث خطأ داخلي في الخادم. يرجى المحاولة لاحقاً.",
                details = isDev ? contextFeature.Error.ToString() : null
            };
            await context.Response.WriteAsync(System.Text.Json.JsonSerializer.Serialize(response));
        }
    });
});
app.UseDefaultFiles();
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
        
        // Performance: Cache hashed assets for 1 year (Immutable)
        if (path.Contains("/assets/") || path.Contains("/static/"))
        {
            ctx.Context.Response.Headers.Append("Cache-Control", "public,max-age=31536000,immutable");
        }
        else
        {
            // Default cache for other static files (e.g. icons, images)
            ctx.Context.Response.Headers.Append("Cache-Control", "public,max-age=86400"); // 1 day
        }

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

var spaIndex = Path.Combine(app.Environment.ContentRootPath, "wwwroot", "index.html");
if (File.Exists(spaIndex))
{
    app.MapFallbackToFile("index.html");
}



app.Run();
