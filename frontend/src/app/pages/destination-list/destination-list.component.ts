import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DestinationService } from '../../services/destination.service';
import { AuthService } from '../../services/auth.service';
import { Destination } from '../../models/destination.model';

@Component({
  selector: 'app-destination-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div class="container">
          <h1 class="page-title">Destinations</h1>
          <a *ngIf="isAdmin" routerLink="/destinations/nouveau" class="btn-add">+ Nouvelle Destination</a>
        </div>
      </div>

      <div class="container">
        <!-- Recherche -->
        <div class="search-bar">
          <input
            type="text"
            placeholder="🔍 Rechercher une destination ou un pays..."
            [(ngModel)]="searchTerm"
            (ngModelChange)="onSearch()"
            class="search-input"
          />
        </div>

        <!-- Loading skeletons -->
        <div class="dest-grid" *ngIf="loading">
          <div class="skeleton-card" *ngFor="let s of [1,2,3,4,5,6]">
            <div class="sk-image"></div>
            <div class="sk-body">
              <div class="sk-line sk-title"></div>
              <div class="sk-line sk-pays"></div>
              <div class="sk-line sk-desc"></div>
              <div class="sk-line sk-desc sk-desc-short"></div>
            </div>
          </div>
        </div>

        <!-- Erreur de chargement -->
        <div class="load-error" *ngIf="loadError && !loading">
          <span>⚠ {{ loadError }}</span>
        </div>

        <!-- Résultats -->
        <p class="results-count" *ngIf="!loading">{{ destinations.length }} destination(s)</p>

        <!-- Grille -->
        <div class="dest-grid" *ngIf="!loading && destinations.length > 0">
          <div class="dest-card" *ngFor="let dest of destinations">
            <div class="dest-image">
              <img *ngIf="dest.image" [src]="getImageUrl(dest.image)" [alt]="dest.nom" />
              <div class="dest-placeholder" *ngIf="!dest.image">🌍</div>
              <span class="climat-tag" *ngIf="dest.climat">{{ dest.climat }}</span>
            </div>
            <div class="dest-body">
              <h3 class="dest-name">{{ dest.nom }}</h3>
              <p class="dest-pays">🌐 {{ dest.pays }}</p>
              <p class="dest-desc" *ngIf="dest.description">{{ dest.description | slice:0:80 }}{{ dest.description && dest.description.length > 80 ? '...' : '' }}</p>
              <div class="dest-meta" *ngIf="dest.langueLocale || dest.monnaie">
                <span *ngIf="dest.langueLocale">🗣 {{ dest.langueLocale }}</span>
                <span *ngIf="dest.monnaie">💰 {{ dest.monnaie }}</span>
              </div>
              <div class="dest-actions" *ngIf="isAdmin">
                <a [routerLink]="['/destinations', dest._id, 'modifier']" class="btn-edit">✏ Modifier</a>
                <button (click)="deleteDestination(dest)" class="btn-delete">🗑 Supprimer</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Vide -->
        <div class="empty-state" *ngIf="!loading && destinations.length === 0">
          <div class="empty-icon">🌍</div>
          <h3>Aucune destination trouvée</h3>
          <a *ngIf="isAdmin" routerLink="/destinations/nouveau" class="btn-add">Ajouter une destination</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { background: #f8f6f0; min-height: 100vh; }
    .page-header { background: #0a1628; padding: 2.5rem 0; margin-bottom: 2rem; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }
    .page-header .container { display: flex; justify-content: space-between; align-items: center; }
    .page-title { color: #fff; font-size: 2rem; font-family: 'Georgia', serif; margin: 0; }
    .btn-add {
      background: #c8a96e; color: #0a1628;
      padding: 0.7rem 1.5rem; border-radius: 6px;
      text-decoration: none; font-weight: 700; font-size: 0.9rem;
    }
    .search-bar { margin-bottom: 1.5rem; }
    .search-input {
      width: 100%; max-width: 480px;
      padding: 0.75rem 1rem;
      border: 1px solid #e0d8cc;
      border-radius: 8px; font-size: 0.95rem;
      background: #fff; outline: none; box-sizing: border-box;
      transition: border-color 0.2s;
    }
    .search-input:focus { border-color: #c8a96e; }
    .results-count { font-size: 0.9rem; color: #888; margin-bottom: 1.25rem; }
    .loading { text-align: center; padding: 4rem; color: #888; }
    .load-error {
      background: #fde8e8; color: #c0392b;
      padding: 1rem 1.25rem; border-radius: 8px;
      margin-bottom: 1.5rem; font-size: 0.9rem;
    }
    /* ── Skeleton cards ── */
    @keyframes shimmer {
      0%   { background-position: -600px 0; }
      100% { background-position: 600px 0; }
    }
    .skeleton-card {
      background: #fff;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(0,0,0,0.07);
    }
    .sk-image {
      height: 160px;
      background: linear-gradient(90deg, #e8e4dc 25%, #f0ece4 50%, #e8e4dc 75%);
      background-size: 600px 100%;
      animation: shimmer 1.4s infinite linear;
    }
    .sk-body { padding: 1.1rem; }
    .sk-line {
      border-radius: 4px;
      background: linear-gradient(90deg, #e8e4dc 25%, #f0ece4 50%, #e8e4dc 75%);
      background-size: 600px 100%;
      animation: shimmer 1.4s infinite linear;
      margin-bottom: 0.55rem;
    }
    .sk-title { height: 14px; width: 60%; }
    .sk-pays  { height: 11px; width: 40%; }
    .sk-desc  { height: 11px; width: 90%; }
    .sk-desc-short { width: 65%; }
    .spinner {
      width: 40px; height: 40px;
      border: 3px solid #e0d8cc;
      border-top-color: #c8a96e;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 1rem;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .dest-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem; }
    .dest-card {
      background: #fff; border-radius: 10px;
      overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.07);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .dest-card:hover { transform: translateY(-3px); box-shadow: 0 6px 24px rgba(0,0,0,0.11); }
    .dest-image {
      height: 160px;
      background: linear-gradient(135deg, #1a3a6e, #0a1628);
      position: relative; overflow: hidden;
    }
    .dest-image img { width: 100%; height: 100%; object-fit: cover; }
    .dest-placeholder {
      width: 100%; height: 100%;
      display: flex; align-items: center; justify-content: center;
      font-size: 3rem;
    }
    .climat-tag {
      position: absolute; bottom: 8px; left: 8px;
      background: rgba(10,22,40,0.8); color: #c8a96e;
      padding: 0.15rem 0.6rem; border-radius: 20px;
      font-size: 0.72rem; text-transform: capitalize;
    }
    .dest-body { padding: 1.1rem; }
    .dest-name { font-size: 1.05rem; font-weight: 700; color: #0a1628; margin: 0 0 0.2rem; font-family: 'Georgia', serif; }
    .dest-pays { color: #888; font-size: 0.82rem; margin: 0 0 0.5rem; }
    .dest-desc { color: #666; font-size: 0.85rem; line-height: 1.5; margin: 0 0 0.5rem; }
    .dest-meta { display: flex; gap: 0.75rem; margin-bottom: 0.75rem; font-size: 0.8rem; color: #888; }
    .dest-actions { display: flex; gap: 0.5rem; }
    .btn-edit {
      background: #f5f3ee; color: #555;
      padding: 0.4rem 0.8rem; border-radius: 5px;
      text-decoration: none; font-size: 0.8rem;
      transition: background 0.2s; flex: 1; text-align: center;
    }
    .btn-edit:hover { background: #e8e2d8; }
    .btn-delete {
      background: #fff0f0; color: #c0392b;
      padding: 0.4rem 0.8rem; border-radius: 5px;
      border: none; cursor: pointer; font-size: 0.8rem;
      transition: background 0.2s; flex: 1;
    }
    .btn-delete:hover { background: #fde8e8; }
    .empty-state { text-align: center; padding: 5rem 2rem; color: #999; }
    .empty-icon { font-size: 4rem; margin-bottom: 1rem; opacity: 0.3; }
    .empty-state h3 { color: #555; margin-bottom: 1rem; }
  `],
})
export class DestinationListComponent implements OnInit {
  destinations: Destination[] = [];
  loading = false;
  loadError = '';
  isAdmin = false;
  searchTerm = '';

  constructor(
    private destinationService: DestinationService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.loadDestinations();
  }

  loadDestinations(): void {
    this.loading = true;
    this.loadError = '';
    this.cdr.markForCheck();
    this.destinationService.getAll(this.searchTerm || undefined).subscribe({
      next: (res) => {
        this.zone.run(() => {
          this.destinations = res.data as Destination[];
          this.loading = false;
          this.cdr.markForCheck();
        });
      },
      error: (err) => {
        this.zone.run(() => {
          this.loadError = err.error?.message || 'Impossible de charger les destinations. Vérifiez que le serveur est démarré.';
          this.destinations = [];
          this.loading = false;
          this.cdr.markForCheck();
        });
      },
    });
  }

  onSearch(): void {
    this.loadDestinations();
  }

  deleteDestination(dest: Destination): void {
    if (!confirm(`Supprimer la destination "${dest.nom}" ?`)) return;
    this.destinationService.delete(dest._id!).subscribe({
      next: () => {
        this.destinations = this.destinations.filter((d) => d._id !== dest._id);
      },
      error: (err) => alert('Erreur: ' + err.error?.message),
    });
  }

  getImageUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('data:') || path.startsWith('http')) return path;
    return `http://localhost:4000${path}`;
  }
}
