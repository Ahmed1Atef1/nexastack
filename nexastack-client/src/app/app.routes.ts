import { Routes } from '@angular/router';

/**
 * Application routes.
 *
 * Marketing pages (Home, Services, About, Contact) are consolidated
 * into a single scrolling landing page loaded at '/'.
 *
 * Only the Admin Dashboard remains as a separate route.
 */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home').then(m => m.Home),
    title: 'NexaStack — We Build Digital Products That Scale'
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/inquiry-list/inquiry-list').then(m => m.InquiryList),
    title: 'NexaStack — Admin Dashboard'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
