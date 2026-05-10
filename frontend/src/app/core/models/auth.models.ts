/** Payload sent to POST /api/auth/register */
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

/** Payload sent to POST /api/auth/login */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Public user shape returned by both auth endpoints */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

/** Successful auth response from the backend */
export interface AuthResponse {
  token: string;
  user: AuthUser;
}
