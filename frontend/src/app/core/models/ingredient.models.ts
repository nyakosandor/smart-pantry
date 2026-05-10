/** A pantry ingredient as returned by the backend. */
export interface Ingredient {
  _id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  calories: number;
  /** ISO 8601 date string — optional. */
  expirationDate?: string;
  /** Minimum stock level for threshold alerts — optional. */
  minimumThreshold?: number;
  createdAt: string;
  updatedAt: string;
}

/** Payload sent to POST /api/ingredients. */
export interface CreateIngredientRequest {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  calories: number;
  expirationDate?: string;
  minimumThreshold?: number;
}
