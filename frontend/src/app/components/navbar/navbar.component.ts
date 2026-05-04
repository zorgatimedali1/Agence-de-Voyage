import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav class="navbar">
      <div class="nav-container">
        <a routerLink="/" class="nav-brand">
          <span class="brand-icon">✈</span>
          <span class="brand-name">LWZ <span class="brand-accent">Voyage</span></span>
        </a>

        <button class="nav-toggle" (click)="toggleMenu()" [class.active]="menuOpen">
          <span></span><span></span><span></span>
        </button>

        <ul class="nav-links" [class.open]="menuOpen">
          <li>
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="closeMenu()">Accueil</a>
          </li>
          <li>
            <a routerLink="/voyages" routerLinkActive="active" (click)="closeMenu()">Voyages</a>
          </li>
          <li>
            <a routerLink="/destinations" routerLinkActive="active" (click)="closeMenu()">Destinations</a>
          </li>

          <!-- Admin menu -->
          <ng-container *ngIf="isAdmin">
            <li>
              <a routerLink="/admin/dashboard" routerLinkActive="active" (click)="closeMenu()" class="nav-admin">
                📊 Dashboard
              </a>
            </li>
            <li>
              <a routerLink="/voyages/nouveau" class="nav-cta" (click)="closeMenu()">+ Nouveau Voyage</a>
            </li>
            <li>
              <button (click)="logout()" class="nav-logout">Déconnexion</button>
            </li>
          </ng-container>

          <!-- Public: login button -->
          <ng-container *ngIf="!isAdmin">
            <li>
              <a routerLink="/admin/login" class="nav-login" (click)="closeMenu()">🔐 Admin</a>
            </li>
          </ng-container>
        </ul>
      </div>
    </nav>
  `,
  styles: [`
    .navbar { background: #0a1628; box-shadow: 0 2px 20px rgba(0,0,0,0.3); position: sticky; top: 0; z-index: 1000; height: 70px; }
    .nav-container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; display: flex; align-items: center; justify-content: space-between; height: 100%; }
    .nav-brand { display: flex; align-items: center; gap: 0.6rem; text-decoration: none; font-family: 'Georgia', serif; }
    .brand-icon { font-size: 1.6rem; color: #c8a96e; }
    .brand-name { font-size: 1.3rem; color: #fff; font-weight: 600; letter-spacing: 0.02em; }
    .brand-accent { color: #c8a96e; }
    .nav-links { display: flex; align-items: center; gap: 0.25rem; list-style: none; margin: 0; padding: 0; }
    .nav-links a { color: #b0bec5; text-decoration: none; padding: 0.5rem 1rem; border-radius: 6px; font-size: 0.95rem; transition: all 0.2s; font-family: 'Georgia', serif; }
    .nav-links a:hover, .nav-links a.active { color: #fff; background: rgba(200,169,110,0.15); }
    .nav-links a.active { color: #c8a96e; }
    .nav-cta { background: #c8a96e !important; color: #0a1628 !important; font-weight: 700 !important; padding: 0.5rem 1.2rem !important; }
    .nav-cta:hover { background: #d4b87e !important; }
    .nav-admin { color: #c8a96e !important; }
    .nav-login { border: 1px solid rgba(200,169,110,0.4) !important; color: #c8a96e !important; }
    .nav-login:hover { background: rgba(200,169,110,0.1) !important; }
    .nav-logout { background: rgba(231,76,60,0.15); color: #e74c3c; border: 1px solid rgba(231,76,60,0.3); padding: 0.45rem 0.9rem; border-radius: 6px; cursor: pointer; font-size: 0.88rem; transition: all 0.2s; font-family: 'Georgia', serif; }
    .nav-logout:hover { background: rgba(231,76,60,0.25); }
    .nav-toggle { display: none; }
    @media (max-width: 768px) {
      .nav-toggle { display: flex; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 5px; }
      .nav-toggle span { display: block; width: 25px; height: 2px; background: #fff; transition: all 0.3s; }
      .nav-links { display: none; position: absolute; top: 70px; left: 0; right: 0; background: #0a1628; flex-direction: column; padding: 1rem; gap: 0.5rem; border-top: 1px solid rgba(200,169,110,0.2); }
      .nav-links.open { display: flex; }
      .nav-links a, .nav-logout { width: 100%; }
    }
  `],
})
export class NavbarComponent implements OnInit {
  menuOpen = false;
  isAdmin = false;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.auth.isAdmin$.subscribe(v => this.isAdmin = v);
  }

  toggleMenu() { this.menuOpen = !this.menuOpen; }
  closeMenu() { this.menuOpen = false; }

  logout(): void {
    this.auth.logout();
    this.closeMenu();
    this.router.navigate(['/']);
  }
}
