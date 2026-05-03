import { Schema, model, type Model, type HydratedDocument } from 'mongoose';
import type { IIngredient } from '../types/ingredient.types.js';

type IngredientModel = Model<IIngredient>;

const ingredientSchema = new Schema<IIngredient, IngredientModel>(
  {
    name: {
      type: String,
      required: [true, 'Ingredient name is required'],
      unique: true,
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      maxlength: [50, 'Category cannot exceed 50 characters'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      // Mongoose auto-casts strings to Number; we want to reject anything
      // that is not a finite number to keep the data clean.
      validate: {
        validator: (v: number) => Number.isFinite(v),
        message: 'Quantity must be a valid number',
      },
    },
    calories: {
      type: Number,
      required: [true, 'Calories are required'],
      min: [0, 'Calories cannot be negative'],
      validate: {
        validator: (v: number) => Number.isFinite(v),
        message: 'Calories must be a valid number',
      },
    },
  },
  { timestamps: true },
);

// Note: the unique index on `name` is created automatically by `unique: true`
// on the field above. It triggers a MongoDB E11000 error on duplicates, which
// the central error middleware maps to a 409 response.

export type IngredientDocument = HydratedDocument<IIngredient>;

export const Ingredient = model<IIngredient, IngredientModel>(
  'Ingredient',
  ingredientSchema,
);
