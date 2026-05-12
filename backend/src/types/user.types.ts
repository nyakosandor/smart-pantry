export interface IUser {
  name: string;
  email: string;
  password: string;
}

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}
