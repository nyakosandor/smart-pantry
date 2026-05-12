import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import type { RecipeSuggestion } from '../models/recipe.models';

@Injectable({ providedIn: 'root' })
export class RecipeService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/recipes`;

  getSuggestions(): Observable<RecipeSuggestion[]> {
    return this.http.get<RecipeSuggestion[]>(`${this.base}/suggest`);
  }
}
