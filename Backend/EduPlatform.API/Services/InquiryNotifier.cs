using EduPlatform.API.Models;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace EduPlatform.API.Services;

public interface IInquiryNotifier
{
    /// <summary>Best-effort email to the owner. Never throws; the inquiry is already saved.</summary>
    Task NotifyAsync(TeacherInquiry inquiry, string? bookletTitle);
}

/// <summary>
/// Sends an email when TEACHERS_NOTIFY_EMAIL and SMTP_HOST are configured; otherwise does nothing
/// (the inquiry still appears in the admin list and the teacher gets a WhatsApp link).
/// </summary>
public class InquiryNotifier : IInquiryNotifier
{
    private readonly ILogger<InquiryNotifier> _log;

    public InquiryNotifier(ILogger<InquiryNotifier> log) { _log = log; }

    public async Task NotifyAsync(TeacherInquiry i, string? bookletTitle)
    {
        var to = Environment.GetEnvironmentVariable("TEACHERS_NOTIFY_EMAIL");
        var host = Environment.GetEnvironmentVariable("SMTP_HOST");
        if (string.IsNullOrWhiteSpace(to) || string.IsNullOrWhiteSpace(host)) return;

        try
        {
            var port = int.TryParse(Environment.GetEnvironmentVariable("SMTP_PORT"), out var p) ? p : 587;
            var user = Environment.GetEnvironmentVariable("SMTP_USER");
            var pass = Environment.GetEnvironmentVariable("SMTP_PASS");
            var from = Environment.GetEnvironmentVariable("SMTP_FROM") ?? user ?? to;

            var msg = new MimeMessage();
            msg.From.Add(MailboxAddress.Parse(from));
            msg.To.Add(MailboxAddress.Parse(to));
            msg.Subject = $"طلب جديد من مدرس: {i.Name} ({i.Quantity} نسخة)";
            msg.Body = new TextPart("plain")
            {
                Text = $"الاسم: {i.Name}\nالهاتف: {i.Phone}\nالمحافظة: {i.Governorate}\n" +
                       $"المذكرة: {bookletTitle ?? "طلب عام"}\nالمرحلة: {i.GradeLevel}\nالمادة: {i.Subject}\n" +
                       $"الكمية: {i.Quantity}\nملاحظات: {i.Notes}\n"
            };

            using var client = new SmtpClient();
            await client.ConnectAsync(host, port, SecureSocketOptions.StartTlsWhenAvailable);
            if (!string.IsNullOrEmpty(user)) await client.AuthenticateAsync(user, pass);
            await client.SendAsync(msg);
            await client.DisconnectAsync(true);
        }
        catch (Exception ex)
        {
            _log.LogWarning(ex, "Teacher inquiry email notification failed");
        }
    }
}
