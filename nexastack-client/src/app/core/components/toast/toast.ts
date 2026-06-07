import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-global-toast',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toast-container" [class.visible]="toast.visible" [ngClass]="toast.type">
      <div class="toast-content">
        <span class="toast-icon">
          <!-- Success Icon -->
          <svg *ngIf="toast.type === 'success'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          <!-- Error Icon -->
          <svg *ngIf="toast.type === 'error'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <!-- Warning Icon -->
          <svg *ngIf="toast.type === 'warning'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          <!-- Info Icon -->
          <svg *ngIf="toast.type === 'info'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
        </span>
        <span class="toast-message">{{ toast.message }}</span>
      </div>
      <button class="toast-close" (click)="closeToast()">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: -100px;
      right: 24px;
      z-index: 9999;
      background: var(--surface);
      border: 1px solid var(--border);
      color: var(--text-primary);
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      min-width: 300px;
      max-width: 400px;
      transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      opacity: 0;
      pointer-events: none;
      
      &.visible {
        bottom: 24px;
        opacity: 1;
        pointer-events: auto;
      }
      
      &.success { border-left: 4px solid var(--success); }
      &.error { border-left: 4px solid var(--error); }
      &.warning { border-left: 4px solid #eab308; }
      &.info { border-left: 4px solid var(--primary); }
    }

    .toast-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .toast-icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .success .toast-icon { color: var(--success); }
    .error .toast-icon { color: var(--error); }
    .warning .toast-icon { color: #eab308; }
    .info .toast-icon { color: var(--primary); }

    .toast-message {
      font-size: 0.9rem;
      font-weight: 500;
      line-height: 1.4;
    }

    .toast-close {
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      display: flex;
      padding: 4px;
      border-radius: 4px;
      transition: all 0.2s;
      
      &:hover {
        background: var(--hover-bg);
        color: var(--text-primary);
      }
    }
  `]
})
export class ToastComponent {
  toast: Toast = { message: '', type: 'info', visible: false };

  constructor(
    private readonly toastService: ToastService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.toastService.toast$.pipe(takeUntilDestroyed()).subscribe(t => {
      this.toast = t;
      this.cdr.markForCheck();
    });
  }

  closeToast() {
    this.toastService.hide();
  }
}
