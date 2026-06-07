/**
 * Represents a contact inquiry returned by the API.
 * Maps to: NexaStack.API.DTOs.ContactInquiryDto
 *
 * Used for displaying existing inquiries (GET responses).
 */
export interface ContactInquiry {
  id: number;
  fullName: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;   // ISO 8601 date string from the API (e.g. "2026-06-05T14:38:51.539Z")
  isRead: boolean;
}

/**
 * Represents the payload for creating a new contact inquiry.
 * Maps to: NexaStack.API.DTOs.CreateContactInquiryDto
 *
 * Used for POST requests — only includes fields the client should provide.
 * Server sets: id, createdAt, isRead.
 */
export interface CreateContactInquiry {
  fullName: string;
  email: string;
  subject: string;
  message: string;
}
