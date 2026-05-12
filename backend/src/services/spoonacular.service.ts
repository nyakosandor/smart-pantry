import axios from 'axios';

const BASE_URL = 'https://api.spoonacular.com/recipes';
const MAX_RESULTS = 9;

interface SpoonacularIngredient {
  name: string;
}

interface SpoonacularRecipe {
  id: number;
  title: string;
  image: string;
  usedIngredientCount: number;
  missedIngredientCount: number;
  missedIngredients: SpoonacularIngredient[];
}

export interface RecipeSuggestion {
  id: number;
  title: string;
  image: string;
  usedIngredientCount: number;
  missedIngredientCount: number;
  missedIngredients: string[];
}

export async function findRecipesByIngredients(
  ingredientNames: string[],
): Promise<RecipeSuggestion[]> {
  const apiKey = process.env['SPOONACULAR_API_KEY'];
  if (!apiKey) {
    throw new Error('SPOONACULAR_API_KEY is not set. Add it to your .env file.');
  }

  const { data } = await axios.get<SpoonacularRecipe[]>(
    `${BASE_URL}/findByIngredients`,
    {
      params: {
        apiKey,
        ingredients: ingredientNames.join(','),
        number: MAX_RESULTS,
        ranking: 2, // minimise missing ingredients rather than maximise used ones
        ignorePantry: true,
      },
      timeout: 10_000,
    },
  );

  return data.map((r) => ({
    id: r.id,
    title: r.title,
    image: r.image,
    usedIngredientCount: r.usedIngredientCount,
    missedIngredientCount: r.missedIngredientCount,
    missedIngredients: r.missedIngredients.map((i) => i.name),
  }));
}
