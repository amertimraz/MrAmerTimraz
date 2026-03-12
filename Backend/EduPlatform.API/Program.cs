using System.Text;
using EduPlatform.API.Data;
using EduPlatform.API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

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
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)),
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

var allowedOrigins = Environment.GetEnvironmentVariable("ALLOWED_ORIGINS")?.Split(',')
    ?? ["http://localhost:5173", "http://localhost:3000", "http://localhost:5174"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod());
});

builder.Services.AddControllers()
    .AddJsonOptions(o =>
    {
        o.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
        o.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
    try { db.Database.ExecuteSqlRaw("ALTER TABLE LibraryItems ADD COLUMN ThumbnailUrl TEXT;"); } catch { }
    try { db.Database.ExecuteSqlRaw("ALTER TABLE InteractiveQuizzes ADD COLUMN CoverImageUrl TEXT;"); } catch { }
    try { db.Database.ExecuteSqlRaw("ALTER TABLE \"InteractiveQuizzes\" ADD COLUMN \"TeacherName\" TEXT;"); } catch { }
    try { db.Database.ExecuteSqlRaw("ALTER TABLE \"InteractiveQuizzes\" ADD COLUMN \"TeacherImage\" TEXT;"); } catch { }
    try { db.Database.ExecuteSqlRaw("ALTER TABLE \"InteractiveQuizzes\" ADD COLUMN \"WhatsappUrl\" TEXT;"); } catch { }
    try { db.Database.ExecuteSqlRaw("ALTER TABLE \"InteractiveQuizzes\" ADD COLUMN \"YoutubeUrl\" TEXT;"); } catch { }
    try { db.Database.ExecuteSqlRaw("ALTER TABLE \"InteractiveQuizzes\" ADD COLUMN \"FacebookUrl\" TEXT;"); } catch { }
    try { db.Database.ExecuteSqlRaw("ALTER TABLE \"InteractiveQuizzes\" ADD COLUMN \"ShowSupportButton\" BOOLEAN NOT NULL DEFAULT TRUE;"); } catch { }
    try
    {
        db.Database.ExecuteSqlRaw(@"
            CREATE TABLE IF NOT EXISTS InteractiveQuizzes (
                Id INTEGER PRIMARY KEY AUTOINCREMENT,
                Title TEXT NOT NULL,
                Subject TEXT,
                Grade TEXT,
                Description TEXT,
                CreatedAt TEXT NOT NULL DEFAULT (datetime('now'))
            );");
        db.Database.ExecuteSqlRaw(@"
            CREATE TABLE IF NOT EXISTS InteractiveQuestions (
                Id INTEGER PRIMARY KEY AUTOINCREMENT,
                QuizId INTEGER NOT NULL,
                Text TEXT NOT NULL,
                Type TEXT NOT NULL DEFAULT 'MCQ',
                Options TEXT,
                CorrectAnswer TEXT,
                Explanation TEXT,
                OrderIndex INTEGER NOT NULL DEFAULT 0,
                FOREIGN KEY (QuizId) REFERENCES InteractiveQuizzes(Id) ON DELETE CASCADE
            );");
    }
    catch { }
    await DbSeeder.SeedAsync(db);
}

app.UseCors("AllowFrontend");
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
