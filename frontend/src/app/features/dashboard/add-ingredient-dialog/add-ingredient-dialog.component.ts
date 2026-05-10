import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { HttpErrorResponse } from '@angular/common/http';

import { IngredientService } from '../../../core/services/ingredient.service';
import { strictNumber } from '../../../core/validators/number.validators';
import type { Ingredient } from '../../../core/models/ingredient.models';

export type DialogResult = Ingredient | undefined;

/** Preset units shown in the select. The last option allows free-text entry. */
export const UNITS = [
  { value: 'pcs',  label: 'pcs — pieces' },
  { value: 'g',    label: 'g — grams' },
  { value: 'kg',   label: 'kg — kilograms' },
  { value: 'ml',   label: 'ml — millilitres' },
  { value: 'L',    label: 'L — litres' },
  { value: 'oz',   label: 'oz — ounces' },
  { value: 'lbs',  label: 'lbs — pounds' },
  { value: 'cups', label: 'cups' },
  { value: 'tbsp', label: 'tbsp — tablespoons' },
  { value: 'tsp',  label: 'tsp — teaspoons' },
  { value: 'slices', label: 'slices' },
];

@Component({
  selector: 'app-add-ingredient-dialog',
  providers: [provideNativeDateAdapter()],
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
  ],
  templateUrl: './add-ingredient-dialog.component.html',
  styleUrl: './add-ingredient-dialog.component.scss',
})
export class AddIngredientDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly ingredientService = inject(IngredientService);
  private readonly dialogRef = inject(MatDialogRef<AddIngredientDialogComponent>);

  readonly isLoading = signal(false);
  readonly today = new Date();
  readonly units = UNITS;

  readonly form = this.fb.group({
    name:             ['', [Validators.required, Validators.minLength(2)]],
    category:         ['', [Validators.required]],
    quantity:         ['', [Validators.required, strictNumber()]],
    unit:             ['pcs', [Validators.required]],
    calories:         ['', [Validators.required, strictNumber()]],
    expirationDate:   [null as Date | null],
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
        expirationDate:
          raw.expirationDate
            ? (raw.expirationDate as Date).toISOString()
            : undefined,
        minimumThreshold:
          raw.minimumThreshold !== '' && raw.minimumThreshold !== null
            ? Number(raw.minimumThreshold)
            : undefined,
      })
      .subscribe({
        next: (created) => this.dialogRef.close(created),
        error: (err: HttpErrorResponse) => {
          this.isLoading.set(false);
          const message: string =
            err.error?.message ?? 'Something went wrong. Please try again.';
          this.dialogRef.close({ __error: message } as unknown as DialogResult);
        },
      });
  }

  onCancel(): void {
    this.dialogRef.close(undefined);
  }
}
