import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent implements OnInit, OnDestroy {
  isMobileMenuOpen = false;
  isDarkMode = false;
  activeSection = 'hero';

  private scrollHandler!: () => void;
  private isBrowser: boolean;

  /** Section IDs that the scroll spy monitors, in DOM order. */
  private readonly sections = ['hero', 'services', 'about', 'portfolio', 'contact'];

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    if (!this.isBrowser) return;

    // Theme setup
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.isDarkMode = savedTheme === 'dark';
    } else {
      this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    this.applyTheme();

    // Scroll spy
    this.scrollHandler = () => this.updateActiveSection();
    window.addEventListener('scroll', this.scrollHandler, { passive: true });
  }

  ngOnDestroy() {
    if (this.isBrowser && this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
    }
  }

  /**
   * Scroll to a section by its ID.
   * If we're not on the home page, navigate there first.
   */
  scrollTo(sectionId: string) {
    this.closeMobileMenu();

    const isHomePage = this.router.url === '/' || this.router.url === '';

    if (isHomePage) {
      this.smoothScrollToElement(sectionId);
    } else {
      // Navigate to home, then scroll after render
      this.router.navigate(['/']).then(() => {
        setTimeout(() => this.smoothScrollToElement(sectionId), 100);
      });
    }
  }

  private smoothScrollToElement(id: string) {
    if (id === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  private updateActiveSection() {
    let newActiveSection = 'hero';

    // Walk sections in reverse to find the last one whose top is at or above the navbar threshold
    for (let i = this.sections.length - 1; i >= 0; i--) {
      const el = document.getElementById(this.sections[i]);
      if (el) {
        const rect = el.getBoundingClientRect();
        // 150px threshold to trigger slightly before the section hits the absolute top
        if (rect.top <= 150) {
          newActiveSection = this.sections[i];
          break;
        }
      }
    }

    if (this.activeSection !== newActiveSection) {
      this.activeSection = newActiveSection;
      this.cdr.detectChanges();
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    this.applyTheme();
  }

  private applyTheme() {
    if (this.isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }
}
