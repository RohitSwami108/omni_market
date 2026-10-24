import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputErrorComponent } from '../../shared/components/input-error/input-error.component';

@Component({
  selector: 'app-auth-portal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputErrorComponent],
  templateUrl: './auth-portal.component.html',
  styleUrl: './auth-portal.component.scss'
})
export class AuthPortalComponent {
  // Signals for view switching & UI states
  readonly isRegisterMode = signal<boolean>(false);
  readonly showPassword = signal<boolean>(false);
  readonly showConfirmPassword = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);

  // Reactive Forms
  readonly loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    rememberMe: new FormControl(false)
  });

  readonly registerForm = new FormGroup({
    fullName: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    confirmPassword: new FormControl('', [Validators.required]),
    agreeTerms: new FormControl(false, [Validators.requiredTrue])
  });

  // Password strength calculation computed signal
  readonly passwordStrength = computed(() => {
    const pwd = this.registerForm.controls.password.value || '';
    if (!pwd) return { score: 0, label: 'None', colorClass: 'none' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { score: 1, label: 'Weak', colorClass: 'weak' };
    if (score === 2) return { score: 2, label: 'Fair', colorClass: 'fair' };
    if (score === 3) return { score: 3, label: 'Good', colorClass: 'good' };
    return { score: 4, label: 'Enterprise Strong', colorClass: 'strong' };
  });

  toggleMode(register: boolean) {
    this.isRegisterMode.set(register);
  }

  togglePasswordVisibility(field: 'password' | 'confirm') {
    if (field === 'password') {
      this.showPassword.update(v => !v);
    } else {
      this.showConfirmPassword.update(v => !v);
    }
  }

  handleLoginSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.isSubmitting.set(true);
    setTimeout(() => {
      this.isSubmitting.set(false);
    }, 1200);
  }

  handleRegisterSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    this.isSubmitting.set(true);
    setTimeout(() => {
      this.isSubmitting.set(false);
    }, 1200);
  }
}
