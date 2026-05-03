/**
 * Plain-data shape of a User document, independent of Mongoose.
 * Reusable from any layer (controllers, DTOs, eventually the Angular
 * frontend through a shared package).
 */
export interface IUser {
  name: string;
  email: string;
  password: string;
}

/**
 * Instance methods exposed by the User Mongoose model.
 */
export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}
