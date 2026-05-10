import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  /** Toggles between the Login and Register panels. */
  readonly isRegisterMode = signal(false);

  /** Shows/hides the password characters. */
  readonly passwordVisible = signal(false);

  /** True while an HTTP call is in flight. */
  readonly isLoading = signal(false);

  /** Backend error message to display below the form. */
  readonly serverError = signal<string | null>(null);

  readonly form: FormGroup = this.fb.group({
    name: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  get nameControl() {
    return this.form.get('name')!;
  }
  get emailControl() {
    return this.form.get('email')!;
  }
  get passwordControl() {
    return this.form.get('password')!;
  }

  toggleMode(): void {
    this.isRegisterMode.update((v) => !v);
    this.serverError.set(null);
    this.form.reset();

    // The `name` field is only required in register mode.
    if (this.isRegisterMode()) {
      this.nameControl.setValidators([
        Validators.required,
        Validators.minLength(2),
      ]);
    } else {
      this.nameControl.clearValidators();
    }
    this.nameControl.updateValueAndValidity();
  }

  togglePasswordVisibility(): void {
    this.passwordVisible.update((v) => !v);
  }

  onSubmit(): void {
    if (this.form.invalid || this.isLoading()) return;

    this.serverError.set(null);
    this.isLoading.set(true);

    const { name, email, password } = this.form.getRawValue() as {
      name: string;
      email: string;
      password: string;
    };

    const request$ = this.isRegisterMode()
      ? this.auth.register({ name, email, password })
      : this.auth.login({ email, password });

    request$.subscribe({
      next: () => {
        const redirectUrl =
          this.route.snapshot.queryParamMap.get('redirectUrl') ?? '/dashboard';
        void this.router.navigateByUrl(redirectUrl);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.serverError.set(
          err.error?.message ?? 'Something went wrong. Please try again.',
        );
      },
    });
  }
}
