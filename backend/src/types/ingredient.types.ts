/**
 * Plain-data shape of an Ingredient document, independent of Mongoose.
 */
export interface IIngredient {
  name: string;
  category: string;
  quantity: number;
  calories: number;
}
