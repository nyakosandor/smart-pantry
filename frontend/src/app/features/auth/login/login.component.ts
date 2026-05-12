import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly isRegisterMode = signal(false);
  readonly passwordVisible = signal(false);
  readonly isLoading = signal(false);
  readonly serverError = signal<string | null>(null);

  readonly form = inject(FormBuilder).group({
    name:     [''],
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  get nameControl()     { return this.form.controls.name; }
  get emailControl()    { return this.form.controls.email; }
  get passwordControl() { return this.form.controls.password; }

  toggleMode(): void {
    this.isRegisterMode.update((v) => !v);
    this.serverError.set(null);
    this.form.reset();

    if (this.isRegisterMode()) {
      this.nameControl.setValidators([Validators.required, Validators.minLength(2)]);
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

    const { name, email, password } = this.form.getRawValue();

    const request$ = this.isRegisterMode()
      ? this.auth.register({ name: name ?? '', email: email ?? '', password: password ?? '' })
      : this.auth.login({ email: email ?? '', password: password ?? '' });

    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
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
