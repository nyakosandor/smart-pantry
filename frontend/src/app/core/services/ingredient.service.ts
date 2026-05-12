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

  getAll(): Observable<Ingredient[]> {
    return this.http.get<Ingredient[]>(this.base);
  }

  create(payload: CreateIngredientRequest): Observable<Ingredient> {
    return this.http.post<Ingredient>(this.base, payload);
  }

  update(id: string, payload: UpdateIngredientRequest): Observable<Ingredient> {
    return this.http.put<Ingredient>(`${this.base}/${id}`, payload);
  }

  delete(id: string): Observable<{ message: string; id: string }> {
    return this.http.delete<{ message: string; id: string }>(`${this.base}/${id}`);
  }

  getShoppingList(): Observable<Ingredient[]> {
    return this.http.get<Ingredient[]>(`${environment.apiUrl}/shopping-list`);
  }
}
