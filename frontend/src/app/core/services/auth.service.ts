import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  AuthUser,
} from '../models/auth.models';

const TOKEN_KEY = 'sp_token';
const USER_KEY = 'sp_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  // --- Reactive state via signals ---

  /** The raw JWT string, or null when logged out. */
  private readonly _token = signal<string | null>(
    localStorage.getItem(TOKEN_KEY),
  );

  /** The logged-in user, or null when logged out. */
  private readonly _user = signal<AuthUser | null>(
    AuthService.parseStoredUser(),
  );

  /** Public read-only signal: current user. */
  readonly currentUser = this._user.asReadonly();

  /** True when a valid token is present in memory. */
  readonly isLoggedIn = computed(() => this._token() !== null);

  // --- Auth actions ---

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/register`, payload)
      .pipe(tap((res) => this.persistSession(res)));
  }

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, payload)
      .pipe(tap((res) => this.persistSession(res)));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._token.set(null);
    this._user.set(null);
    void this.router.navigate(['/login']);
  }

  /** Returns the raw token string — used by the JWT interceptor. */
  getToken(): string | null {
    return this._token();
  }

  // --- Private helpers ---

  private persistSession(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this._token.set(res.token);
    this._user.set(res.user);
  }

  private static parseStoredUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }
}
