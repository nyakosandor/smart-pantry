import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  Output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { IngredientService } from '../../../core/services/ingredient.service';
import { strictNumber } from '../../../core/validators/number.validators';
import type { Ingredient } from '../../../core/models/ingredient.models';

export const UNITS = [
  { value: 'pcs',    label: 'pcs — pieces' },
  { value: 'g',      label: 'g — grams' },
  { value: 'kg',     label: 'kg — kilograms' },
  { value: 'ml',     label: 'ml — millilitres' },
  { value: 'L',      label: 'L — litres' },
  { value: 'oz',     label: 'oz — ounces' },
  { value: 'lbs',    label: 'lbs — pounds' },
  { value: 'cups',   label: 'cups' },
  { value: 'tbsp',   label: 'tbsp — tablespoons' },
  { value: 'tsp',    label: 'tsp — teaspoons' },
  { value: 'slices', label: 'slices' },
];

@Component({
  selector: 'app-add-ingredient-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: './add-ingredient-dialog.component.html',
  styleUrl: './add-ingredient-dialog.component.scss',
})
export class AddIngredientDialogComponent {
  private readonly ingredientService = inject(IngredientService);
  private readonly destroyRef = inject(DestroyRef);

  /** Emitted when an ingredient is successfully created. */
  @Output() saved = new EventEmitter<Ingredient>();
  /** Emitted when the user dismisses the form without saving. */
  @Output() cancelled = new EventEmitter<void>();
  /** Emitted when the backend returns an error, so the parent can show a toast. */
  @Output() saveFailed = new EventEmitter<string>();

  readonly isLoading = signal(false);
  readonly units = UNITS;
  readonly today = new Date().toISOString().split('T')[0];

  readonly form = inject(FormBuilder).group({
    name:             ['', [Validators.required, Validators.minLength(2)]],
    category:         ['', [Validators.required]],
    quantity:         ['', [Validators.required, strictNumber()]],
    unit:             ['pcs', [Validators.required]],
    calories:         ['', [Validators.required, strictNumber()]],
    expirationDate:   [null as string | null],
    minimumThreshold: ['', [strictNumber()]],
  });

  get name()             { return this.form.controls.name; }
  get category()         { return this.form.controls.category; }
  get quantity()         { return this.form.controls.quantity; }
  get unit()             { return this.form.controls.unit; }
  get calories()         { return this.form.controls.calories; }
  get minimumThreshold() { return this.form.controls.minimumThreshold; }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.isLoading()) return;

    this.isLoading.set(true);
    const raw = this.form.getRawValue();

    this.ingredientService
      .create({
        name:     raw.name!.trim(),
        category: raw.category!.trim(),
        quantity: Number(raw.quantity),
        unit:     raw.unit!,
        calories: Number(raw.calories),
        expirationDate: raw.expirationDate
          ? new Date(raw.expirationDate).toISOString()
          : undefined,
        minimumThreshold:
          raw.minimumThreshold !== '' && raw.minimumThreshold !== null
            ? Number(raw.minimumThreshold)
            : undefined,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (created) => {
          this.isLoading.set(false);
          this.saved.emit(created);
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading.set(false);
          this.saveFailed.emit(
            err.error?.message ?? 'Something went wrong. Please try again.',
          );
        },
      });
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
