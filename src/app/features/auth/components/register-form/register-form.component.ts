import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { InputErrorComponent } from '../../../../shared/components/input-error/input-error.component';

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputErrorComponent],
  templateUrl: './register-form.component.html',
  styleUrl: './register-form.component.scss'
})
export class RegisterFormComponent {
  readonly isSubmitting = input<boolean>(false);
  readonly submitRegister = output<{ fullName: string; email: string; password: string; agreeTerms: boolean }>();

  readonly showPassword = signal<boolean>(false);

  readonly registerForm = new FormGroup({
    fullName: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    agreeTerms: new FormControl(false, [Validators.requiredTrue])
  });

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

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    const val = this.registerForm.value;
    this.submitRegister.emit({
      fullName: val.fullName!,
      email: val.email!,
      password: val.password!,
      agreeTerms: !!val.agreeTerms
    });
  }
}

