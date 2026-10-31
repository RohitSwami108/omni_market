import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { InputErrorComponent } from '../../../../shared/components/input-error/input-error.component';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputErrorComponent],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.scss'
})
export class LoginFormComponent {
  readonly isSubmitting = input<boolean>(false);
  readonly submitLogin = output<{ email: string; password: string; rememberMe: boolean }>();

  readonly showPassword = signal<boolean>(false);

  readonly loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    rememberMe: new FormControl(false)
  });

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    const val = this.loginForm.value;
    this.submitLogin.emit({
      email: val.email!,
      password: val.password!,
      rememberMe: !!val.rememberMe
    });
  }
}

