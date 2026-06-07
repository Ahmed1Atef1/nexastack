import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactInquiryService } from '../../../core/services/contact-inquiry.service';
import { ContactInquiry } from '../../../shared/models/contact-inquiry.model';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-inquiry-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inquiry-list.html',
  styleUrls: ['./inquiry-list.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InquiryList implements OnInit {
  inquiries: ContactInquiry[] = [];
  filteredInquiries: ContactInquiry[] = [];

  // UI State
  isLoading = true;
  hasError = false;

  // Search & Filter
  searchTerm = '';
  activeFilter: 'all' | 'read' | 'unread' = 'all';

  // Sort
  sortColumn: keyof ContactInquiry = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';

  // View Modal
  selectedInquiry: ContactInquiry | null = null;
  isModalOpen = false;

  inquiryToDelete: ContactInquiry | null = null;
  isDeleteDialogOpen = false;

  constructor(
    private readonly inquiryService: ContactInquiryService,
    private readonly cdr: ChangeDetectorRef,
    private readonly toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadInquiries();
  }

  // ── Stats ──────────────────────────────────────
  get totalCount(): number { return this.inquiries.length; }
  get readCount(): number { return this.inquiries.filter(i => i.isRead).length; }
  get unreadCount(): number { return this.inquiries.filter(i => !i.isRead).length; }
  get latestDate(): string {
    if (this.inquiries.length === 0) return '—';
    return this.inquiries[0].createdAt; // Already sorted desc by API
  }

  // ── Data Loading ───────────────────────────────
  loadInquiries(): void {
    this.isLoading = true;
    this.hasError = false;
    this.inquiryService.getAll().subscribe({
      next: (data) => {
        this.inquiries = data;
        this.applyFilters();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.hasError = true;
        this.cdr.detectChanges();
      }
    });
  }

  // ── Search & Filter ────────────────────────────
  onSearchChange(): void { this.applyFilters(); }
  setFilter(filter: 'all' | 'read' | 'unread'): void {
    this.activeFilter = filter;
    this.applyFilters();
  }

  private applyFilters(): void {
    let result = [...this.inquiries];

    // Filter by status
    if (this.activeFilter === 'read') {
      result = result.filter(i => i.isRead);
    } else if (this.activeFilter === 'unread') {
      result = result.filter(i => !i.isRead);
    }

    // Search
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(i =>
        i.fullName.toLowerCase().includes(term) ||
        i.email.toLowerCase().includes(term) ||
        i.subject.toLowerCase().includes(term)
      );
    }

    // Sort
    result.sort((a, b) => {
      const valA = a[this.sortColumn];
      const valB = b[this.sortColumn];
      let comparison = 0;
      if (typeof valA === 'string' && typeof valB === 'string') {
        comparison = valA.localeCompare(valB);
      } else if (typeof valA === 'number' && typeof valB === 'number') {
        comparison = valA - valB;
      } else if (typeof valA === 'boolean' && typeof valB === 'boolean') {
        comparison = (valA === valB) ? 0 : valA ? 1 : -1;
      }
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });

    this.filteredInquiries = result;
  }

  // ── Sorting ────────────────────────────────────
  sortBy(column: keyof ContactInquiry): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applyFilters();
  }

  getSortIcon(column: keyof ContactInquiry): string {
    if (this.sortColumn !== column) return '↕';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  // ── View Inquiry ───────────────────────────────
  viewInquiry(inquiry: ContactInquiry): void {
    this.selectedInquiry = inquiry;
    this.isModalOpen = true;

    // Auto-mark as read when viewed
    if (!inquiry.isRead) {
      this.toggleRead(inquiry, true);
    }
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedInquiry = null;
  }

  // ── Mark as Read ───────────────────────────────
  toggleRead(inquiry: ContactInquiry, silent = false): void {
    this.inquiryService.toggleRead(inquiry.id).subscribe({
      next: (updated) => {
        const idx = this.inquiries.findIndex(i => i.id === inquiry.id);
        if (idx > -1) {
          this.inquiries[idx] = updated;
        }
        if (this.selectedInquiry?.id === inquiry.id) {
          this.selectedInquiry = updated;
        }
        this.applyFilters();
        if (!silent) {
          this.toastService.show(updated.isRead ? 'Inquiry marked as read' : 'Inquiry marked as unread', 'success');
        }
        this.cdr.markForCheck();
      },
      error: () => {
        // Error toast handled globally
        this.cdr.markForCheck();
      }
    });
  }

  // ── Delete ─────────────────────────────────────
  confirmDelete(inquiry: ContactInquiry): void {
    this.inquiryToDelete = inquiry;
    this.isDeleteDialogOpen = true;
  }

  cancelDelete(): void {
    this.isDeleteDialogOpen = false;
    this.inquiryToDelete = null;
  }

  executeDelete(): void {
    if (!this.inquiryToDelete) return;
    const id = this.inquiryToDelete.id;
    this.inquiryService.delete(id).subscribe({
      next: () => {
        this.inquiries = this.inquiries.filter(i => i.id !== id);
        this.applyFilters();
        this.isDeleteDialogOpen = false;
        this.inquiryToDelete = null;
        // Close modal if the deleted inquiry was being viewed
        if (this.selectedInquiry?.id === id) {
          this.closeModal();
        }
        this.toastService.show('Inquiry deleted successfully', 'success');
        this.cdr.markForCheck();
      },
      error: () => {
        this.isDeleteDialogOpen = false;
        this.inquiryToDelete = null;
        // Error toast handled globally
        this.cdr.markForCheck();
      }
    });
  }

  // ── Helpers ────────────────────────────────────
  formatDate(iso: string): string {
    const dateStr = iso.endsWith('Z') ? iso : `${iso}Z`;
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  shortDate(iso: string): string {
    const dateStr = iso.endsWith('Z') ? iso : `${iso}Z`;
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  }

  // ── trackBy for ngFor ──────────────────────────
  trackById(_index: number, inquiry: ContactInquiry): number {
    return inquiry.id;
  }
}
