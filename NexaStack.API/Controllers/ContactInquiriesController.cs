using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using NexaStack.API.Data;
using NexaStack.API.DTOs;
using NexaStack.API.Mappings;

namespace NexaStack.API.Controllers;

/// <summary>
/// API controller for managing contact inquiries.
/// Provides full CRUD operations: Create, Read (single + list), Update (mark as read), Delete.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class ContactInquiriesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ContactInquiriesController(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Returns all contact inquiries, ordered by most recent first.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<ContactInquiryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<ContactInquiryDto>>> GetAll()
    {
        var inquiries = await _context.ContactInquiries
            .OrderByDescending(i => i.CreatedAt)
            .Select(i => i.ToDto())
            .AsNoTracking()
            .ToListAsync();

        return Ok(inquiries);
    }

    /// <summary>
    /// Returns a single contact inquiry by its ID.
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ContactInquiryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ContactInquiryDto>> GetById(int id)
    {
        var inquiry = await _context.ContactInquiries
            .AsNoTracking()
            .FirstOrDefaultAsync(i => i.Id == id);

        if (inquiry is null)
            return NotFound(new { message = $"Contact inquiry with ID {id} was not found." });

        return Ok(inquiry.ToDto());
    }

    /// <summary>
    /// Creates a new contact inquiry from the submitted form data.
    /// </summary>
    [HttpPost]
    [EnableRateLimiting("ContactInquiryPolicy")]
    [ProducesResponseType(typeof(ContactInquiryDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<ActionResult<ContactInquiryDto>> Create([FromBody] CreateContactInquiryDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var entity = dto.ToEntity();

        _context.ContactInquiries.Add(entity);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetById),
            new { id = entity.Id },
            entity.ToDto());
    }

    /// <summary>
    /// Marks a contact inquiry as read or unread.
    /// </summary>
    [HttpPatch("{id:int}/read")]
    [ProducesResponseType(typeof(ContactInquiryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ContactInquiryDto>> ToggleRead(int id)
    {
        var inquiry = await _context.ContactInquiries.FindAsync(id);

        if (inquiry is null)
            return NotFound(new { message = $"Contact inquiry with ID {id} was not found." });

        inquiry.IsRead = !inquiry.IsRead;
        await _context.SaveChangesAsync();

        return Ok(inquiry.ToDto());
    }

    /// <summary>
    /// Deletes a contact inquiry by its ID.
    /// </summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        var inquiry = await _context.ContactInquiries.FindAsync(id);

        if (inquiry is null)
            return NotFound(new { message = $"Contact inquiry with ID {id} was not found." });

        _context.ContactInquiries.Remove(inquiry);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
