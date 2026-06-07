import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { ContactInquiryService } from '../../../core/services/contact-inquiry.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact-form.html',
  styleUrls: ['./contact-form.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactForm implements OnInit, OnDestroy {
  contactForm!: FormGroup;
  isSubmitting = false;
  isRateLimited = false;
  rateLimitCountdown = 0;
  countdownFormatted = '00:00';
  private timerInterval: any;

  constructor(
    private readonly fb: FormBuilder,
    private readonly contactService: ContactInquiryService,
    private readonly cdr: ChangeDetectorRef,
    private readonly toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.contactForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required, Validators.minLength(5)]],
      message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]]
    });
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  // Helper getters for easy template access
  get f() { return this.contactForm.controls; }

  onSubmit(): void {
    if (this.contactForm.invalid || this.isRateLimited) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    this.contactService.create(this.contactForm.value)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          this.contactForm.reset();
          this.toastService.show("Your message has been sent successfully. We'll be in touch!", 'success');
        },
        error: (err) => {
          console.error('Error submitting form:', err);
          
          if (err.status === 429) {
            // Determine wait time from the backend JSON response or Retry-After header
            let waitSeconds = 120; // Default fallback to 2 minutes
            
            if (err.error && err.error.retryAfterSeconds) {
              waitSeconds = parseInt(err.error.retryAfterSeconds, 10);
            } else if (err.headers && err.headers.get('Retry-After')) {
              waitSeconds = parseInt(err.headers.get('Retry-After')!, 10);
            }
            
            this.startRateLimitCountdown(waitSeconds);
          }
          // Note: Other errors are handled globally by ErrorInterceptor
        }
      });
  }

  private startRateLimitCountdown(seconds: number): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    
    this.isRateLimited = true;
    this.rateLimitCountdown = seconds;
    this.updateFormattedTime();
    this.cdr.detectChanges();
    
    this.timerInterval = setInterval(() => {
      this.rateLimitCountdown--;
      this.updateFormattedTime();
      
      if (this.rateLimitCountdown <= 0) {
        clearInterval(this.timerInterval);
        this.isRateLimited = false;
      }
      
      this.cdr.detectChanges();
    }, 1000);
  }

  private updateFormattedTime(): void {
    const minutes = Math.floor(this.rateLimitCountdown / 60);
    const seconds = this.rateLimitCountdown % 60;
    this.countdownFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}
