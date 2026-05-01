import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="notfound-page">
      <div class="notfound-content">
        <div class="notfound-plane">✈</div>
        <h1 class="notfound-code">404</h1>
        <h2 class="notfound-title">Page introuvable</h2>
        <p class="notfound-desc">
          La destination que vous cherchez n'existe pas ou a été déplacée.
        </p>
        <a routerLink="/" class="btn-home">Retour à l'accueil</a>
      </div>
    </div>
  `,
  styles: [`
    .notfound-page {
      background: #f8f6f0;
      min-height: calc(100vh - 180px);
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 3rem 1.5rem;
    }
    .notfound-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
    .notfound-plane {
      font-size: 4.5rem;
      animation: float 3s ease-in-out infinite;
      color: #c8a96e;
    }
    @keyframes float {
      0%, 100% { transform: translateY(0) rotate(-10deg); }
      50%       { transform: translateY(-16px) rotate(10deg); }
    }
    .notfound-code {
      font-size: 6rem;
      font-family: 'Georgia', serif;
      font-weight: 700;
      color: #0a1628;
      line-height: 1;
      margin: 0;
    }
    .notfound-title {
      font-size: 1.5rem;
      font-family: 'Georgia', serif;
      color: #333;
      margin: 0;
    }
    .notfound-desc {
      color: #888;
      font-size: 0.95rem;
      max-width: 360px;
      line-height: 1.6;
      margin: 0;
    }
    .btn-home {
      margin-top: 0.5rem;
      background: #c8a96e;
      color: #0a1628;
      padding: 0.8rem 2rem;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 700;
      font-family: 'Georgia', serif;
      transition: all 0.2s;
    }
    .btn-home:hover {
      background: #d4b87e;
      transform: translateY(-2px);
    }
  `],
})
export class NotFoundComponent {}
