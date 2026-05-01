import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-brand">
          <span class="footer-icon">✈</span>
          <span class="footer-name">Zorgati <span class="footer-accent">Voyage</span></span>
        </div>
        <p class="footer-text">
          Projet MEAN Stack — Polytechnique Sousse
        </p>
        <p class="footer-copy">
          © 2026 Zorgati Voyage · Tous droits réservés
        </p>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: #0a1628;
      color: #607d8b;
      padding: 2.5rem 1.5rem;
      text-align: center;
      margin-top: auto;
    }
    .footer-container {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }
    .footer-brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.25rem;
    }
    .footer-icon { font-size: 1.3rem; color: #c8a96e; }
    .footer-name {
      font-size: 1.1rem;
      color: #ccc;
      font-family: 'Georgia', serif;
      font-weight: 600;
    }
    .footer-accent { color: #c8a96e; }
    .footer-text  { font-size: 0.82rem; color: #607d8b; }
    .footer-copy  { font-size: 0.78rem; color: #546e7a; }
  `],
})
export class FooterComponent {}
