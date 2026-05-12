import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';

import { IngredientService } from '../../core/services/ingredient.service';
import { RecipeService } from '../../core/services/recipe.service';
import { ToastService } from '../../core/services/toast.service';
import type { Ingredient } from '../../core/models/ingredient.models';
import type { RecipeSuggestion } from '../../core/models/recipe.models';
import { AddIngredientDialogComponent } from './add-ingredient-dialog/add-ingredient-dialog.component';
import { InventoryChartComponent } from './analytics/inventory-chart/inventory-chart.component';
import { RecipeSuggestionsComponent } from './recipe-suggestions/recipe-suggestions.component';
import { ModalComponent } from '../../shared/modal/modal.component';

type ExpiryStatus = 'none' | 'expiring' | 'expired';

const MS_PER_DAY          = 24 * 60 * 60 * 1000;
const EXPIRY_WARNING_DAYS = 7;

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    ModalComponent,
    AddIngredientDialogComponent,
    InventoryChartComponent,
    RecipeSuggestionsComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly ingredientService = inject(IngredientService);
  private readonly recipeService     = inject(RecipeService);
  private readonly toast             = inject(ToastService);
  private readonly destroyRef        = inject(DestroyRef);

  readonly isLoading        = signal(true);
  readonly errorMessage     = signal<string | null>(null);
  readonly deletingId       = signal<string | null>(null);
  readonly isLoadingRecipes = signal(false);
  readonly recipes          = signal<RecipeSuggestion[] | null>(null);
  readonly showAddModal     = signal(false);

  private readonly _ingredients = signal<Ingredient[]>([]);

  readonly ingredients       = this._ingredients.asReadonly();
  readonly rowCount          = computed(() => this._ingredients().length);
  readonly isEmpty           = computed(() => !this.isLoading() && this.rowCount() === 0);
  readonly expiringSoonCount = computed(
    () => this._ingredients().filter((i) => this.getExpiryStatus(i._id) === 'expiring').length,
  );

  /**
   * Pre-computes the expiry status for every ingredient once per list update.
   * Template expressions read from this Map (O(1)) rather than recalculating
   * Date arithmetic on every change-detection pass.
   */
  readonly expiryStatusMap = computed<ReadonlyMap<string, ExpiryStatus>>(() => {
    const map = new Map<string, ExpiryStatus>();
    for (const ingredient of this._ingredients()) {
      map.set(ingredient._id, this.computeExpiryStatus(ingredient.expirationDate));
    }
    return map;
  });

  ngOnInit(): void {
    this.loadIngredients();
  }

  loadIngredients(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.ingredientService
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (list) => {
          this._ingredients.set(list);
          this.isLoading.set(false);
        },
        error: () => {
          this.errorMessage.set('Failed to load ingredients. Please try again.');
          this.isLoading.set(false);
        },
      });
  }

  getExpiryStatus(id: string): ExpiryStatus {
    return this.expiryStatusMap().get(id) ?? 'none';
  }

  deleteIngredient(ingredient: Ingredient): void {
    if (!confirm(`Remove "${ingredient.name}" from your pantry?`)) return;

    this.deletingId.set(ingredient._id);

    this.ingredientService
      .delete(ingredient._id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this._ingredients.set(this._ingredients().filter((i) => i._id !== ingredient._id));
          this.deletingId.set(null);
          this.toast.show(`"${ingredient.name}" was removed from your pantry.`, 'success');
        },
        error: () => {
          this.deletingId.set(null);
          this.toast.show('Failed to delete ingredient. Please try again.', 'error');
        },
      });
  }

  onIngredientSaved(ingredient: Ingredient): void {
    this._ingredients.set([ingredient, ...this._ingredients()]);
    this.showAddModal.set(false);
    this.toast.show(`"${ingredient.name}" was added to your pantry.`, 'success');
  }

  onIngredientSaveFailed(message: string): void {
    this.toast.show(message, 'error');
  }

  loadRecipeSuggestions(): void {
    if (this.isLoadingRecipes()) return;

    this.isLoadingRecipes.set(true);

    this.recipeService
      .getSuggestions()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (list) => {
          this.recipes.set(list);
          this.isLoadingRecipes.set(false);
        },
        error: () => {
          this.isLoadingRecipes.set(false);
          this.toast.show(
            'Could not fetch recipe suggestions. Check your Spoonacular API key or try again later.',
            'error',
          );
        },
      });
  }

  private computeExpiryStatus(dateStr?: string): ExpiryStatus {
    if (!dateStr) return 'none';
    const msLeft = new Date(dateStr).getTime() - Date.now();
    if (msLeft < 0) return 'expired';
    if (msLeft <= EXPIRY_WARNING_DAYS * MS_PER_DAY) return 'expiring';
    return 'none';
  }
}
