using System.Text.RegularExpressions;
using NexaStack.API.DTOs;
using NexaStack.API.Models;

namespace NexaStack.API.Mappings;

/// <summary>
/// Extension methods for mapping between ContactInquiry entities and DTOs.
/// Manual mapping is used instead of AutoMapper — for a single entity with 6 fields,
/// explicit mapping is clearer, faster, and has zero dependencies.
/// </summary>
public static partial class ContactInquiryMappings
{
    /// <summary>
    /// Maps a CreateContactInquiryDto to a new ContactInquiry entity.
    /// Server-controlled fields (Id, CreatedAt, IsRead) are set to defaults.
    /// Input is sanitized: trimmed, email normalized, and HTML tags stripped.
    /// </summary>
    public static ContactInquiry ToEntity(this CreateContactInquiryDto dto)
    {
        return new ContactInquiry
        {
            FullName = Sanitize(dto.FullName),
            Email = dto.Email.Trim().ToLowerInvariant(),
            Subject = Sanitize(dto.Subject),
            Message = Sanitize(dto.Message)
        };
    }

    /// <summary>
    /// Maps a ContactInquiry entity to a ContactInquiryDto for API responses.
    /// </summary>
    public static ContactInquiryDto ToDto(this ContactInquiry entity)
    {
        return new ContactInquiryDto
        {
            Id = entity.Id,
            FullName = entity.FullName,
            Email = entity.Email,
            Subject = entity.Subject,
            Message = entity.Message,
            CreatedAt = entity.CreatedAt,
            IsRead = entity.IsRead
        };
    }

    /// <summary>
    /// Sanitizes user-provided text by trimming whitespace and stripping HTML tags.
    /// Prevents stored XSS by ensuring no raw HTML/script content is persisted.
    /// </summary>
    private static string Sanitize(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return string.Empty;

        // Strip HTML tags to prevent stored XSS
        var stripped = HtmlTagPattern().Replace(input, string.Empty);

        return stripped.Trim();
    }

    [GeneratedRegex("<[^>]*(>|$)", RegexOptions.Compiled)]
    private static partial Regex HtmlTagPattern();
}
