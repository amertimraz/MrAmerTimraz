using System.Text;

namespace EduPlatform.API.Services;

/// <summary>Normalizes Egyptian mobile numbers to the local 11-digit form (01XXXXXXXXX).</summary>
public static class PhoneNormalizer
{
    private static readonly string[] Prefixes = { "010", "011", "012", "015" };

    public static string? Normalize(string? input)
    {
        if (string.IsNullOrWhiteSpace(input)) return null;

        var sb = new StringBuilder();
        foreach (var ch in input)
        {
            if (ch >= '0' && ch <= '9') sb.Append(ch);
            else if (ch >= '٠' && ch <= '٩') sb.Append((char)('0' + (ch - '٠'))); // Arabic-Indic digits
            else if (ch >= '۰' && ch <= '۹') sb.Append((char)('0' + (ch - '۰'))); // Persian digits
            else if (char.IsWhiteSpace(ch) || ch is '-' or '+' or '(' or ')') continue;
            else return null;
        }

        var digits = sb.ToString();
        if (digits.StartsWith("0020")) digits = "0" + digits[4..];
        else if (digits.StartsWith("20") && digits.Length == 12) digits = "0" + digits[2..];

        if (digits.Length != 11 || !Prefixes.Any(p => digits.StartsWith(p))) return null;
        return digits;
    }
}
