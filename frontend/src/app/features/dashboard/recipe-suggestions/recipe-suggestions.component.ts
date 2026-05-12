import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import type { RecipeSuggestion } from '../../../core/models/recipe.models';

@Component({
  selector: 'app-recipe-suggestions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './recipe-suggestions.component.html',
  styleUrl: './recipe-suggestions.component.scss',
})
export class RecipeSuggestionsComponent {
  readonly recipes = input.required<RecipeSuggestion[]>();

  recipeUrl(recipe: RecipeSuggestion): string {
    const slug = recipe.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-');
    return `https://spoonacular.com/recipes/${slug}-${recipe.id}`;
  }
}
