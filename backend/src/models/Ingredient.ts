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
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      trim: true,
      maxlength: [20, 'Unit cannot exceed 20 characters'],
      default: 'pcs',
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      // Mongoose auto-casts strings to Number; the custom validator rejects
      // anything that does not produce a finite result (e.g. "abc", Infinity).
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
    expirationDate: {
      type: Date,
      required: false,
      default: undefined,
    },
    minimumThreshold: {
      type: Number,
      required: false,
      min: [0, 'Minimum threshold cannot be negative'],
      validate: {
        validator: (v: number) => Number.isFinite(v),
        message: 'Minimum threshold must be a valid number',
      },
    },
  },
  { timestamps: true },
);

export type IngredientDocument = HydratedDocument<IIngredient>;

export const Ingredient = model<IIngredient, IngredientModel>(
  'Ingredient',
  ingredientSchema,
);
