using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using System.Threading.RateLimiting;
using NexaStack.API.Data;
using NexaStack.API.Middleware;

var builder = WebApplication.CreateBuilder(args);

// ── Services ────────────────────────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "NexaStack API",
        Version = "v1",
        Description = "Contact Inquiry Management API — NexaStack Internship Assessment"
    });
});

// Entity Framework Core — SQL Server
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// CORS — Environment-aware: allow Angular dev servers in development only.
// In production, configure AllowedOrigins via appsettings or environment variables.
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularDev", policy =>
    {
        var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
            ?? new[] { "http://localhost:4200" };

        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Rate Limiting — Protects endpoints from spam/abuse
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter(policyName: "ContactInquiryPolicy", limiterOptions =>
    {
        limiterOptions.PermitLimit = 4; // 4 submissions
        limiterOptions.Window = TimeSpan.FromMinutes(2); // Per 2 minutes
        limiterOptions.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        limiterOptions.QueueLimit = 0; // Reject immediately, don't queue
    });

    options.OnRejected = async (context, token) =>
    {
        context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
        
        var retryAfter = TimeSpan.FromMinutes(2); // Fallback
        if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfterMetadata))
        {
            retryAfter = retryAfterMetadata;
            context.HttpContext.Response.Headers.RetryAfter = ((int)retryAfter.TotalSeconds).ToString();
        }

        await context.HttpContext.Response.WriteAsJsonAsync(new
        {
            title = "Rate limit exceeded",
            message = "You have reached the inquiry submission limit. Please wait before submitting another request.",
            retryAfterSeconds = (int)Math.Ceiling(retryAfter.TotalSeconds)
        }, cancellationToken: token);
    };
});

var app = builder.Build();

// ── Middleware Pipeline ─────────────────────────────────────────────────

// Global exception handler — must be first to catch all pipeline errors.
app.UseMiddleware<GlobalExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "NexaStack API v1");
        options.DocumentTitle = "NexaStack API — Swagger";
    });
}

app.UseHttpsRedirection();
app.UseCors("AllowAngularDev");
app.UseRateLimiter();
app.MapControllers();

app.Run();
