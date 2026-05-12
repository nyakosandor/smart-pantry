import type { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Validator for fields that must hold a valid finite number.
 * Uses type="text" inputs deliberately — native number inputs have UX
 * quirks (locale-specific decimal separators, silent coercion of pasted
 * values, browser spinner arrows) that this approach avoids entirely.
 */
export function strictNumber(
  allowNegative = false,
): (control: AbstractControl) => ValidationErrors | null {
  return (control: AbstractControl): ValidationErrors | null => {
    const raw = control.value as unknown;

    // Empty values are the concern of Validators.required, not this validator.
    if (raw === null || raw === undefined || String(raw).trim() === '') {
      return null;
    }

    const value = Number(raw);

    if (!Number.isFinite(value)) {
      return { notANumber: true };
    }

    if (!allowNegative && value < 0) {
      return { negative: true };
    }

    return null;
  };
}
