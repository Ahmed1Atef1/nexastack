using Microsoft.EntityFrameworkCore;
using NexaStack.API.Models;

namespace NexaStack.API.Data;

/// <summary>
/// Entity Framework Core database context for the NexaStack application.
/// Provides access to the ContactInquiries table and configures entity mappings.
/// </summary>
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<ContactInquiry> ContactInquiries => Set<ContactInquiry>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<ContactInquiry>(entity =>
        {
            // Table name explicitly set for clarity
            entity.ToTable("ContactInquiries");

            // Index on CreatedAt for sorting queries (most recent first)
            entity.HasIndex(e => e.CreatedAt)
                  .IsDescending();

            // Index on IsRead for filtering unread inquiries
            entity.HasIndex(e => e.IsRead);

            // Default value for CreatedAt handled at database level
            entity.Property(e => e.CreatedAt)
                  .HasDefaultValueSql("GETUTCDATE()");
        });
    }
}
