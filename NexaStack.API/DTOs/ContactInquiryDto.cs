namespace NexaStack.API.DTOs;

/// <summary>
/// Data Transfer Object for returning contact inquiry data to the client.
/// Shapes the API response independently of the database entity.
/// </summary>
public class ContactInquiryDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public bool IsRead { get; set; }
}
