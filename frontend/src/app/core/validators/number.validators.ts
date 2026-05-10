import type { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Validator factory for fields that must contain a valid finite number.
 *
 * Rejects:
 *  - empty / whitespace-only strings  (handled by Validators.required separately)
 *  - strings that cannot be parsed as a number  ("abc", "1.2.3", "NaN")
 *  - Infinity / -Infinity
 *  - negative values (optional: controlled by `allowNegative`)
 *
 * Why not `type="number"`?
 *  The native number input has UX quirks (spinner arrows, browser-locale decimal
 *  separators, silent coercion of pasted values). Using `type="text"` with this
 *  validator gives us full control over the error message and appearance.
 */
export function strictNumber(
  allowNegative = false,
): (control: AbstractControl) => ValidationErrors | null {
  return (control: AbstractControl): ValidationErrors | null => {
    const raw = control.value as unknown;

    // Skip if empty — let Validators.required handle that case separately.
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
