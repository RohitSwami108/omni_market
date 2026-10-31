import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { AuthMarketingComponent } from './components/auth-marketing/auth-marketing.component';
import { LoginFormComponent } from './components/login-form/login-form.component';
import { RegisterFormComponent } from './components/register-form/register-form.component';

@Component({
  selector: 'app-auth-portal',
  standalone: true,
  imports: [CommonModule, AuthMarketingComponent, LoginFormComponent, RegisterFormComponent],
  templateUrl: './auth-portal.component.html',
  styleUrl: './auth-portal.component.scss'
})
export class AuthPortalComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isRegisterMode = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);

  ngOnInit(): void {
    if (this.router.url.includes('register')) {
      this.isRegisterMode.set(true);
    }
  }

  toggleMode(register: boolean): void {
    this.isRegisterMode.set(register);
  }

  handleLogin(credentials: { email: string; password: string; rememberMe: boolean }): void {
    this.isSubmitting.set(true);
    this.authService.login(credentials).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/dashboard/products']);
      },
      error: () => {
        this.isSubmitting.set(false);
      }
    });
  }

  handleRegister(payload: { fullName: string; email: string; password: string; agreeTerms: boolean }): void {
    this.isSubmitting.set(true);
    this.authService.register(payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/dashboard/products']);
      },
      error: () => {
        this.isSubmitting.set(false);
      }
    });
  }
}
