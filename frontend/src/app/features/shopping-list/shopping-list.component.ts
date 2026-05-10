import { Component, inject, signal, OnInit } from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';

import { IngredientService } from '../../core/services/ingredient.service';
import type { Ingredient } from '../../core/models/ingredient.models';

const DISPLAYED_COLUMNS = [
  'name',
  'category',
  'currentQuantity',
  'threshold',
  'deficit',
  'actions',
] as const;

@Component({
  selector: 'app-shopping-list',
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './shopping-list.component.html',
  styleUrl: './shopping-list.component.scss',
})
export class ShoppingListComponent implements OnInit {
  private readonly ingredientService = inject(IngredientService);
  private readonly snackBar = inject(MatSnackBar);

  readonly displayedColumns = [...DISPLAYED_COLUMNS];
  readonly dataSource = new MatTableDataSource<Ingredient>([]);

  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  /** Tracks which row is currently being updated so its button shows a spinner. */
  readonly purchasingId = signal<string | null>(null);

  ngOnInit(): void {
    this.loadShoppingList();
  }

  loadShoppingList(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.ingredientService.getShoppingList().subscribe({
      next: (items) => {
        this.dataSource.data = items;
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load shopping list. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Returns the number of units needed to reach the minimum threshold.
   */
  deficit(item: Ingredient): number {
    return (item.minimumThreshold ?? 0) - item.quantity;
  }

  /**
   * Marks an item as purchased by setting its quantity to its minimumThreshold.
   * This removes the item from the shopping list on the next fetch.
   */
  markAsPurchased(item: Ingredient): void {
    if (!item.minimumThreshold) return;

    this.purchasingId.set(item._id);

    this.ingredientService
      .update(item._id, { quantity: item.minimumThreshold })
      .subscribe({
        next: () => {
          // Remove the item from the local list immediately.
          this.dataSource.data = this.dataSource.data.filter(
            (i) => i._id !== item._id,
          );
          this.purchasingId.set(null);

          this.snackBar.open(
            `"${item.name}" restocked to ${item.minimumThreshold} units.`,
            'OK',
            { duration: 5000 },
          );
        },
        error: () => {
          this.purchasingId.set(null);
          this.snackBar.open(
            'Failed to update quantity. Please try again.',
            'Dismiss',
            { duration: 6000, panelClass: ['snack-error'] },
          );
        },
      });
  }
}
