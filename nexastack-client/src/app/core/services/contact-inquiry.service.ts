import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ContactInquiry, CreateContactInquiry } from '../../shared/models/contact-inquiry.model';
import { environment } from '../../../environments/environment';

/**
 * Service for communicating with the ContactInquiries API.
 * Provides methods for all CRUD operations.
 *
 * Backend endpoints:
 *   GET    /api/ContactInquiries          → getAll()
 *   GET    /api/ContactInquiries/:id      → getById()
 *   POST   /api/ContactInquiries          → create()
 *   PATCH  /api/ContactInquiries/:id/read → toggleRead()
 *   DELETE /api/ContactInquiries/:id      → delete()
 */
@Injectable({
  providedIn: 'root'
})
export class ContactInquiryService {

  private readonly apiUrl = `${environment.apiUrl}/ContactInquiries`;

  constructor(private readonly http: HttpClient) {}

  /** Returns all contact inquiries, ordered by most recent first. */
  getAll(): Observable<ContactInquiry[]> {
    return this.http.get<ContactInquiry[]>(this.apiUrl);
  }

  /** Returns a single contact inquiry by its ID. */
  getById(id: number): Observable<ContactInquiry> {
    return this.http.get<ContactInquiry>(`${this.apiUrl}/${id}`);
  }

  /** Creates a new contact inquiry from the submitted form data. */
  create(inquiry: CreateContactInquiry): Observable<ContactInquiry> {
    return this.http.post<ContactInquiry>(this.apiUrl, inquiry);
  }

  /** Toggles the read/unread status of a contact inquiry. */
  toggleRead(id: number): Observable<ContactInquiry> {
    return this.http.patch<ContactInquiry>(`${this.apiUrl}/${id}/read`, {});
  }

  /** Deletes a contact inquiry by its ID. */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
