import { Schema, model, type Model, type HydratedDocument } from 'mongoose';
import bcrypt from 'bcryptjs';
import type { IUser, IUserMethods } from '../types/user.types.js';

const SALT_ROUNDS = 10;

/**
 * Strongly-typed Mongoose model for User.
 * The generics tell Mongoose: "documents look like IUser, the model has no
 * custom statics, and instance methods come from IUserMethods".
 */
type UserModel = Model<IUser, Record<string, never>, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      // Never return the password hash by default.
      select: false,
    },
  },
  { timestamps: true },
);

/**
 * Hash the password before saving. Runs only when the password
 * field has actually been modified, so updates to other fields
 * will not re-hash an already hashed value.
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err as Error);
  }
});

/**
 * Instance helper used by the login endpoint (Phase 2)
 * to compare a plain-text password against the stored hash.
 */
userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

/** Convenient alias for a fully-hydrated User document. */
export type UserDocument = HydratedDocument<IUser, IUserMethods>;

export const User = model<IUser, UserModel>('User', userSchema);
