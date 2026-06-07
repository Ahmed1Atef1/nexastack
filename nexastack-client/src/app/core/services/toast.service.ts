import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  visible: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new BehaviorSubject<Toast>({ message: '', type: 'info', visible: false });
  toast$ = this.toastSubject.asObservable();
  private timeoutId: any;

  show(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    
    this.toastSubject.next({ message, type, visible: true });

    this.timeoutId = setTimeout(() => {
      this.hide();
    }, 4000);
  }

  hide() {
    const current = this.toastSubject.value;
    this.toastSubject.next({ ...current, visible: false });
  }
}
