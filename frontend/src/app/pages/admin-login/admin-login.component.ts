import { Component, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-page">
      <div class="login-card">
        <div class="login-header">
          <span class="login-icon">✈</span>
          <h1>LWZ <span class="accent">Voyage</span></h1>
          <p>Espace Administration</p>
        </div>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Nom d'utilisateur</label>
            <input formControlName="username" type="text" placeholder="admin" class="form-input" autocomplete="username" />
          </div>
          <div class="form-group">
            <label>Mot de passe</label>
            <input formControlName="password" type="password" placeholder="••••••••" class="form-input" autocomplete="current-password" />
          </div>
          <div class="error-msg" *ngIf="error">{{ error }}</div>
          <button type="submit" [disabled]="loading || form.invalid" class="btn-login">
            {{ loading ? 'Connexion...' : 'Se connecter' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      background: linear-gradient(135deg, #0a1628 0%, #1a2f4e 100%);
      display: flex; align-items: center; justify-content: center;
      padding: 2rem;
    }
    .login-card {
      background: #fff;
      border-radius: 16px;
      padding: 3rem 2.5rem;
      width: 100%; max-width: 400px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .login-header { text-align: center; margin-bottom: 2.5rem; }
    .login-icon { font-size: 2.5rem; display: block; margin-bottom: 0.5rem; }
    .login-header h1 { font-family: 'Georgia', serif; font-size: 1.8rem; color: #0a1628; margin: 0 0 0.25rem; }
    .accent { color: #c8a96e; }
    .login-header p { color: #888; font-size: 0.9rem; margin: 0; }
    .form-group { margin-bottom: 1.25rem; display: flex; flex-direction: column; gap: 0.4rem; }
    label { font-size: 0.85rem; font-weight: 600; color: #444; }
    .form-input {
      padding: 0.75rem 1rem;
      border: 1px solid #e0d8cc;
      border-radius: 8px;
      font-size: 0.95rem;
      outline: none;
      transition: border-color 0.2s;
    }
    .form-input:focus { border-color: #c8a96e; }
    .error-msg {
      background: #fde8e8; color: #c0392b;
      padding: 0.75rem 1rem; border-radius: 6px;
      font-size: 0.85rem; margin-bottom: 1rem;
    }
    .btn-login {
      width: 100%;
      background: #c8a96e; color: #0a1628;
      padding: 0.85rem;
      border: none; border-radius: 8px;
      font-size: 1rem; font-weight: 700;
      font-family: 'Georgia', serif;
      cursor: pointer; transition: all 0.2s;
    }
    .btn-login:hover:not(:disabled) { background: #d4b87e; }
    .btn-login:disabled { opacity: 0.6; cursor: not-allowed; }
  `],
})
export class AdminLoginComponent {
  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });
  loading = false;
  error = '';

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router, private cdr: ChangeDetectorRef, private zone: NgZone) {}

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    const { username, password } = this.form.value;
    this.auth.login(username!, password!).subscribe({
      next: () => {
        this.zone.run(() => { this.loading = false; this.router.navigate(['/admin/dashboard']); });
      },
      error: (err) => {
        this.zone.run(() => { this.loading = false; this.error = err.error?.message || 'Identifiants incorrects'; this.cdr.markForCheck(); });
      },
    });
  }
}
