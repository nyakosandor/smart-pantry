import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error';
  exiting: boolean;
}

const DISPLAY_DURATION_MS   = 4500;
const EXIT_ANIMATION_MS     = 300;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;

  readonly toasts = signal<ToastMessage[]>([]);

  show(message: string, type: 'success' | 'error' = 'success'): void {
    const id = ++this.nextId;
    this.toasts.update((current) => [...current, { id, message, type, exiting: false }]);
    setTimeout(() => this.dismiss(id), DISPLAY_DURATION_MS);
  }

  dismiss(id: number): void {
    // Mark as exiting to trigger the CSS slide-out transition.
    this.toasts.update((current) =>
      current.map((t) => (t.id === id ? { ...t, exiting: true } : t)),
    );
    // Remove from DOM after the transition completes.
    setTimeout(() => {
      this.toasts.update((current) => current.filter((t) => t.id !== id));
    }, EXIT_ANIMATION_MS);
  }
}
