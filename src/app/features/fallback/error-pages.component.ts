import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export type FallbackType = '403' | '401' | '404';

@Component({
  selector: 'app-error-pages',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-pages.component.html',
  styleUrl: './error-pages.component.scss'
})
export class ErrorPagesComponent {
  // Signal to switch preview between 403, 401, and 404
  readonly activeView = signal<FallbackType>('403');
  readonly isRetryingAuth = signal<boolean>(false);
  readonly sessionTimeRemaining = signal<number>(24);

  setView(view: FallbackType) {
    this.activeView.set(view);
  }

  retryAuthentication() {
    this.isRetryingAuth.set(true);
    setTimeout(() => {
      this.isRetryingAuth.set(false);
    }, 1800);
  }
}
