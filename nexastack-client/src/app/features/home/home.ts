import { Component, ChangeDetectionStrategy, ElementRef, ViewChildren, QueryList, AfterViewInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ContactForm } from '../contact/contact-form/contact-form';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ContactForm],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Home implements AfterViewInit, OnDestroy {
  @ViewChildren('counter') counters!: QueryList<ElementRef>;

  private counterObserver!: IntersectionObserver;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit() {
    if (!this.isBrowser) return;

    // Counter animation observer
    this.counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLElement;
          this.animateValue(target, 0, parseInt(target.getAttribute('data-target') || '0', 10), 2000);
          this.counterObserver.unobserve(target);
        }
      });
    }, { 
      threshold: 1.0,
      rootMargin: '0px 0px -15% 0px' 
    });

    this.counters.forEach(counter => {
      this.counterObserver.observe(counter.nativeElement);
    });
  }

  ngOnDestroy() {
    if (this.counterObserver) {
      this.counterObserver.disconnect();
    }
  }

  private animateValue(obj: HTMLElement, start: number, end: number, duration: number) {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutQuart
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      obj.innerHTML = Math.floor(easeProgress * (end - start) + start).toString();
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        obj.innerHTML = end.toString(); // Ensure it ends on the exact number
      }
    };
    window.requestAnimationFrame(step);
  }

  scrollTo(sectionId: string, event?: Event) {
    if (event) {
      event.preventDefault();
    }
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
