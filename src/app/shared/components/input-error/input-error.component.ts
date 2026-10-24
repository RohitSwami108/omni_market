import { Component, input, computed } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-input-error',
  standalone: true,
  templateUrl: './input-error.component.html',
  styleUrl: './input-error.component.scss'
})
export class InputErrorComponent {
  /**
   * The AbstractControl to monitor for validation states.
   */
  readonly control = input<AbstractControl | null>(null);

  /**
   * Optional manual error message override.
   */
  readonly customMessage = input<string | null>(null);

  /**
   * Optional manual trigger for invalid state (useful when driving errors via Signals).
   */
  readonly isInvalid = input<boolean>(false);

  /**
   * Optional field label for contextual error messaging (e.g. "Work Email").
   */
  readonly fieldLabel = input<string>('This field');

  /**
   * Evaluates if the error block should be visible.
   * Only displays if control is invalid AND (touched OR dirty), or if explicitly marked invalid.
   */
  readonly shouldShow = computed(() => {
    if (this.isInvalid() || (this.customMessage() && this.customMessage()!.length > 0)) {
      return true;
    }
    const ctrl = this.control();
    if (!ctrl) return false;
    return ctrl.invalid && (ctrl.touched || ctrl.dirty);
  });

  /**
   * Resolves the primary error message from control errors.
   */
  readonly errorMessage = computed(() => {
    if (this.customMessage()) {
      return this.customMessage();
    }
    const ctrl = this.control();
    if (!ctrl || !ctrl.errors) {
      return null;
    }

    const errors: ValidationErrors = ctrl.errors;
    const label = this.fieldLabel();

    if (errors['required']) {
      return `${label} is required.`;
    }
    if (errors['email']) {
      return 'Please enter a valid business email address.';
    }
    if (errors['minlength']) {
      return `${label} must be at least ${errors['minlength'].requiredLength} characters.`;
    }
    if (errors['maxlength']) {
      return `${label} cannot exceed ${errors['maxlength'].requiredLength} characters.`;
    }
    if (errors['pattern']) {
      return `${label} format is invalid.`;
    }
    if (errors['passwordMismatch']) {
      return 'Passwords do not match.';
    }
    if (errors['min']) {
      return `Minimum allowed value is ${errors['min'].min}.`;
    }
    if (errors['max']) {
      return `Maximum allowed value is ${errors['max'].max}.`;
    }

    // Default fallback to first error key
    const firstKey = Object.keys(errors)[0];
    return typeof errors[firstKey] === 'string' ? errors[firstKey] : `${label} is invalid.`;
  });
}
