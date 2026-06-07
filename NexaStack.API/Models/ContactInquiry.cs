using System.ComponentModel.DataAnnotations;

namespace NexaStack.API.Models;

/// <summary>
/// Represents a contact inquiry submitted through the website contact form.
/// This is the core domain entity persisted to the database.
/// </summary>
public class ContactInquiry
{
    public int Id { get; set; }

    [Required, StringLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required, StringLength(150), EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required, StringLength(200)]
    public string Subject { get; set; } = string.Empty;

    [Required, StringLength(2000)]
    public string Message { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public bool IsRead { get; set; } = false;
}
