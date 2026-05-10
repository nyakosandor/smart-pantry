import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { IngredientService } from '../../core/services/ingredient.service';
import type { Ingredient } from '../../core/models/ingredient.models';
import {
  AddIngredientDialogComponent,
  type DialogResult,
} from './add-ingredient-dialog/add-ingredient-dialog.component';
import { InventoryChartComponent } from './analytics/inventory-chart/inventory-chart.component';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const EXPIRY_WARNING_DAYS = 7;

export const DISPLAYED_COLUMNS = [
  'status',
  'name',
  'category',
  'quantity',
  'calories',
  'expirationDate',
  'actions',
] as const;

@Component({
  selector: 'app-dashboard',
  imports: [
    DatePipe,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatSortModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    InventoryChartComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, AfterViewInit {
  private readonly ingredientService = inject(IngredientService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  @ViewChild(MatSort) sort!: MatSort;

  readonly displayedColumns = [...DISPLAYED_COLUMNS];
  readonly dataSource = new MatTableDataSource<Ingredient>([]);

  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly deletingId = signal<string | null>(null);

  /**
   * Maintained as a signal so that computed() functions (isEmpty, chart data)
   * can react when rows are added, removed, or initially loaded.
   */
  private readonly _ingredients = signal<Ingredient[]>([]);

  readonly rowCount = computed(() => this._ingredients().length);
  readonly isEmpty = computed(() => !this.isLoading() && this.rowCount() === 0);

  /** Passes the live ingredient list to the chart component. */
  readonly ingredients = this._ingredients.asReadonly();

  /** Count of items expiring within 7 days (not yet expired). */
  readonly expiringSoonCount = computed(
    () =>
      this._ingredients().filter(
        (i) => this.expiryStatus(i.expirationDate) === 'expiring',
      ).length,
  );

  ngOnInit(): void {
    this.loadIngredients();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  loadIngredients(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.ingredientService.getAll().subscribe({
      next: (list) => {
        this._ingredients.set(list);
        this.dataSource.data = list;
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load ingredients. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  /** Returns the expiry status of an ingredient row. */
  expiryStatus(dateStr?: string): 'none' | 'expiring' | 'expired' {
    if (!dateStr) return 'none';
    const msLeft = new Date(dateStr).getTime() - Date.now();
    if (msLeft < 0) return 'expired';
    if (msLeft <= EXPIRY_WARNING_DAYS * MS_PER_DAY) return 'expiring';
    return 'none';
  }

  deleteIngredient(ingredient: Ingredient): void {
    if (!confirm(`Remove "${ingredient.name}" from your pantry?`)) return;

    this.deletingId.set(ingredient._id);

    this.ingredientService.delete(ingredient._id).subscribe({
      next: () => {
        const updated = this._ingredients().filter(
          (i) => i._id !== ingredient._id,
        );
        this._ingredients.set(updated);
        this.dataSource.data = updated;
        this.deletingId.set(null);

        this.snackBar.open(
          `"${ingredient.name}" was removed from your pantry.`,
          'OK',
          { duration: 4000 },
        );
      },
      error: () => {
        this.deletingId.set(null);
        this.snackBar.open(
          'Failed to delete ingredient. Please try again.',
          'Dismiss',
          { duration: 6000, panelClass: ['snack-error'] },
        );
      },
    });
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(AddIngredientDialogComponent, {
      width: '560px',
      maxWidth: '95vw',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: DialogResult) => {
      if (!result) return;

      if ('__error' in (result as object)) {
        const msg = (result as unknown as { __error: string }).__error;
        this.snackBar.open(msg, 'Dismiss', {
          duration: 6000,
          panelClass: ['snack-error'],
        });
        return;
      }

      const updated = [result, ...this._ingredients()];
      this._ingredients.set(updated);
      this.dataSource.data = updated;

      this.snackBar.open(
        `"${result.name}" was added to your pantry.`,
        'OK',
        { duration: 4000 },
      );
    });
  }
}
