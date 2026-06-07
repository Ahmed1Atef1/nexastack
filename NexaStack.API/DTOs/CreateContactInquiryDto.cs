using System.ComponentModel.DataAnnotations;

namespace NexaStack.API.DTOs;

/// <summary>
/// Data Transfer Object for creating a new contact inquiry.
/// Contains only the fields the client should provide — no Id, CreatedAt, or IsRead.
/// Validation attributes enforce API-level input validation.
/// </summary>
public class CreateContactInquiryDto
{
    [Required(ErrorMessage = "Full name is required.")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Full name must be between 2 and 100 characters.")]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email address is required.")]
    [EmailAddress(ErrorMessage = "A valid email address is required.")]
    [StringLength(150, ErrorMessage = "Email must not exceed 150 characters.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Subject is required.")]
    [StringLength(200, MinimumLength = 3, ErrorMessage = "Subject must be between 3 and 200 characters.")]
    public string Subject { get; set; } = string.Empty;

    [Required(ErrorMessage = "Message is required.")]
    [StringLength(2000, MinimumLength = 10, ErrorMessage = "Message must be between 10 and 2000 characters.")]
    public string Message { get; set; } = string.Empty;
}
