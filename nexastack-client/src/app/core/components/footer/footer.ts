import { Component, ChangeDetectionStrategy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.html',
  styleUrls: ['./footer.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private readonly router: Router
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  scrollTo(sectionId: string) {
    if (!this.isBrowser) return;

    const isHomePage = this.router.url === '/' || this.router.url === '';

    if (isHomePage) {
      this.smoothScrollToElement(sectionId);
    } else {
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
}
