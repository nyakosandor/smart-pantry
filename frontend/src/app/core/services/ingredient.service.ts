import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import type { Ingredient, CreateIngredientRequest } from '../models/ingredient.models';

/** Fields that can be sent to PUT /api/ingredients/:id */
export type UpdateIngredientRequest = Partial<Omit<CreateIngredientRequest, 'name'>>;

@Injectable({ providedIn: 'root' })
export class IngredientService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/ingredients`;

  /** Fetch all pantry ingredients (newest first, as sorted by the backend). */
  getAll(): Observable<Ingredient[]> {
    return this.http.get<Ingredient[]>(this.base);
  }

  /** Add a new ingredient to the pantry. */
  create(payload: CreateIngredientRequest): Observable<Ingredient> {
    return this.http.post<Ingredient>(this.base, payload);
  }

  /**
   * Partially update an ingredient.
   * Only the fields included in `payload` are changed on the server.
   */
  update(id: string, payload: UpdateIngredientRequest): Observable<Ingredient> {
    return this.http.put<Ingredient>(`${this.base}/${id}`, payload);
  }

  /** Permanently delete an ingredient by its MongoDB id. */
  delete(id: string): Observable<{ message: string; id: string }> {
    return this.http.delete<{ message: string; id: string }>(
      `${this.base}/${id}`,
    );
  }

  /**
   * Fetch all ingredients where quantity < minimumThreshold.
   * Only items with a defined minimumThreshold are included.
   */
  getShoppingList(): Observable<Ingredient[]> {
    return this.http.get<Ingredient[]>(`${environment.apiUrl}/shopping-list`);
  }
}
