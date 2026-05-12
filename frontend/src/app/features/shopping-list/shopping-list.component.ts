import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { IngredientService } from '../../core/services/ingredient.service';
import { ToastService } from '../../core/services/toast.service';
import type { Ingredient } from '../../core/models/ingredient.models';

@Component({
  selector: 'app-shopping-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './shopping-list.component.html',
  styleUrl: './shopping-list.component.scss',
})
export class ShoppingListComponent implements OnInit {
  private readonly ingredientService = inject(IngredientService);
  private readonly toast             = inject(ToastService);
  private readonly destroyRef        = inject(DestroyRef);

  readonly isLoading    = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly purchasingId = signal<string | null>(null);

  private readonly _items = signal<Ingredient[]>([]);
  readonly items = this._items.asReadonly();

  ngOnInit(): void {
    this.loadShoppingList();
  }

  loadShoppingList(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.ingredientService
      .getShoppingList()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (list) => {
          this._items.set(list);
          this.isLoading.set(false);
        },
        error: () => {
          this.errorMessage.set('Failed to load shopping list. Please try again.');
          this.isLoading.set(false);
        },
      });
  }

  deficit(item: Ingredient): number {
    return (item.minimumThreshold ?? 0) - item.quantity;
  }

  markAsPurchased(item: Ingredient): void {
    if (!item.minimumThreshold) return;

    this.purchasingId.set(item._id);

    this.ingredientService
      .update(item._id, { quantity: item.minimumThreshold })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this._items.set(this._items().filter((i) => i._id !== item._id));
          this.purchasingId.set(null);
          this.toast.show(`"${item.name}" restocked to ${item.minimumThreshold} ${item.unit}.`, 'success');
        },
        error: () => {
          this.purchasingId.set(null);
          this.toast.show('Failed to update quantity. Please try again.', 'error');
        },
      });
  }
}
