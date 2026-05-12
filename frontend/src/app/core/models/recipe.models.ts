export interface RecipeSuggestion {
  id: number;
  title: string;
  /** Full URL to the Spoonacular recipe image. */
  image: string;
  usedIngredientCount: number;
  missedIngredientCount: number;
  /** Names of ingredients not currently in the pantry. */
  missedIngredients: string[];
}
