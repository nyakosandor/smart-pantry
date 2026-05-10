/**
 * Plain-data shape of an Ingredient document, independent of Mongoose.
 */
export interface IIngredient {
  name: string;
  category: string;
  quantity: number;
  /** Unit of measurement for the quantity (e.g. kg, g, pcs, L, ml). */
  unit: string;
  calories: number;
  /** Optional ISO date string indicating when the item expires. */
  expirationDate?: Date;
  /** Optional minimum stock level — used for threshold alerts. */
  minimumThreshold?: number;
}
