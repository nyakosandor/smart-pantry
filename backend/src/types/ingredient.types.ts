export interface IIngredient {
  name: string;
  category: string;
  quantity: number;
  /** Unit of measurement for the quantity (e.g. kg, g, pcs, L, ml). */
  unit: string;
  calories: number;
  expirationDate?: Date;
  minimumThreshold?: number;
}
