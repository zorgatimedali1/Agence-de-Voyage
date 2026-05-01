import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VoyageService } from '../../services/voyage.service';
import { DestinationService } from '../../services/destination.service';
import { AuthService } from '../../services/auth.service';
import { Voyage, VoyageFilter } from '../../models/voyage.model';
import { Destination } from '../../models/destination.model';

declare const Swal: any;

@Component({
  selector: 'app-voyage-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div class="container">
          <h1 class="page-title">Catalogue des Voyages</h1>
          <a *ngIf="isAdmin" routerLink="/voyages/nouveau" class="btn-add">+ Nouveau Voyage</a>
        </div>
      </div>

      <div class="container">
        <!-- Filtres -->
        <div class="filters-bar">
          <div class="filter-group search-group">
            <input
              type="text"
              placeholder="Rechercher un voyage..."
              [(ngModel)]="filters.search"
              (ngModelChange)="onFilterChange()"
              class="filter-input search-input"
            />
          </div>
          <div class="filter-group">
            <select [(ngModel)]="filters.destination" (ngModelChange)="onFilterChange()" class="filter-select">
              <option value="">Toutes les destinations</option>
              <option *ngFor="let dest of destinations" [value]="dest._id">{{ dest.nom }}, {{ dest.pays }}</option>
            </select>
          </div>
          <div class="filter-group">
            <select [(ngModel)]="filters.type" (ngModelChange)="onFilterChange()" class="filter-select">
              <option value="">Tous les types</option>
              <option value="aventure">Aventure</option>
              <option value="culturel">Culturel</option>
              <option value="balnéaire">Balnéaire</option>
              <option value="montagne">Montagne</option>
              <option value="citytrip">City Trip</option>
              <option value="croisière">Croisière</option>
            </select>
          </div>
          <div class="filter-group">
            <select [(ngModel)]="filters.sortBy" (ngModelChange)="onFilterChange()" class="filter-select">
              <option value="">Trier par défaut</option>
              <option value="prix_asc">Prix croissant</option>
              <option value="prix_desc">Prix décroissant</option>
              <option value="duree_asc">Durée courte</option>
              <option value="date_asc">Date prochaine</option>
            </select>
          </div>
          <button (click)="resetFilters()" class="btn-reset">Réinitialiser</button>
        </div>

        <!-- Résultats -->
        <div class="results-bar">
          <span class="results-count">{{ total }} voyage(s) trouvé(s)</span>
        </div>

        <!-- Loading skeletons -->
        <div class="voyages-grid" *ngIf="loading">
          <div class="skeleton-card" *ngFor="let s of [1,2,3,4,5,6]">
            <div class="sk-image"></div>
            <div class="sk-body">
              <div class="sk-line sk-title"></div>
              <div class="sk-line sk-dest"></div>
              <div class="sk-meta">
                <div class="sk-line sk-tag"></div>
                <div class="sk-line sk-tag"></div>
                <div class="sk-line sk-tag"></div>
              </div>
              <div class="sk-footer">
                <div class="sk-line sk-price"></div>
                <div class="sk-btn"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Erreur de chargement -->
        <div class="load-error" *ngIf="loadError && !loading">
          <span>⚠ {{ loadError }}</span>
        </div>

        <!-- Grille -->
        <div class="voyages-grid" *ngIf="!loading && voyages.length > 0">
          <div class="voyage-card" *ngFor="let voyage of voyages">
            <div class="card-image">
              <img *ngIf="voyage.image" [src]="getImageUrl(voyage.image)" [alt]="voyage.titre" />
              <div class="card-placeholder" *ngIf="!voyage.image">✈</div>
              <span class="card-type">{{ voyage.typeVoyage }}</span>
            </div>
            <div class="card-body">
              <h3 class="card-title">{{ voyage.titre }}</h3>
              <p class="card-dest" *ngIf="getDestination(voyage)">
                📍 {{ getDestination(voyage)?.nom }}, {{ getDestination(voyage)?.pays }}
              </p>
              <div class="card-meta">
                <span>🗓 {{ voyage.dateDepart | date:'dd MMM yyyy' }}</span>
                <span>⏱ {{ voyage.duree }} jours</span>
                <span>👥 {{ voyage.placesDisponibles }} places</span>
              </div>
              <div class="card-footer">
                <span class="card-price">{{ voyage.prix | number:'1.0-0' }} TND</span>
                <div class="card-actions">
                  <a [routerLink]="['/voyages', voyage._id]" class="btn-view">Voir</a>
                  <ng-container *ngIf="isAdmin">
                    <a [routerLink]="['/voyages', voyage._id, 'modifier']" class="btn-edit">✏</a>
                    <button (click)="deleteVoyage(voyage)" class="btn-delete">🗑</button>
                  </ng-container>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Vide -->
        <div class="empty-state" *ngIf="!loading && voyages.length === 0">
          <div class="empty-icon">✈</div>
          <h3>Aucun voyage trouvé</h3>
          <p>Essayez de modifier vos critères de recherche</p>
          <a *ngIf="isAdmin" routerLink="/voyages/nouveau" class="btn-add">Ajouter un voyage</a>
        </div>

        <!-- Pagination -->
        <div class="pagination" *ngIf="pages > 1">
          <button (click)="changePage(currentPage - 1)" [disabled]="currentPage === 1" class="page-btn">‹</button>
          <button
            *ngFor="let p of getPagesArray()"
            (click)="changePage(p)"
            [class.active]="p === currentPage"
            class="page-btn"
          >{{ p }}</button>
          <button (click)="changePage(currentPage + 1)" [disabled]="currentPage === pages" class="page-btn">›</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { background: #f8f6f0; min-height: 100vh; }
    .page-header {
      background: #0a1628;
      padding: 2.5rem 0;
      margin-bottom: 2rem;
    }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }
    .page-header .container { display: flex; justify-content: space-between; align-items: center; }
    .page-title { color: #fff; font-size: 2rem; font-family: 'Georgia', serif; margin: 0; }
    .btn-add {
      background: #c8a96e;
      color: #0a1628;
      padding: 0.7rem 1.5rem;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 700;
      font-size: 0.9rem;
    }
    .filters-bar {
      background: #fff;
      padding: 1.25rem;
      border-radius: 10px;
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.06);
    }
    .filter-group { flex: 1; min-width: 160px; }
    .filter-input, .filter-select {
      width: 100%;
      padding: 0.6rem 0.85rem;
      border: 1px solid #e0d8cc;
      border-radius: 6px;
      font-size: 0.9rem;
      background: #fafaf8;
      color: #333;
      outline: none;
      transition: border-color 0.2s;
    }
    .filter-input:focus, .filter-select:focus { border-color: #c8a96e; }
    .search-group { flex: 2; min-width: 220px; }
    .btn-reset {
      padding: 0.6rem 1rem;
      background: none;
      border: 1px solid #ddd;
      border-radius: 6px;
      cursor: pointer;
      color: #666;
      font-size: 0.85rem;
      transition: all 0.2s;
    }
    .btn-reset:hover { border-color: #c8a96e; color: #c8a96e; }
    .results-bar { margin-bottom: 1.25rem; }
    .results-count { font-size: 0.9rem; color: #888; }
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
      height: 180px;
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
      margin-bottom: 0.5rem;
    }
    .sk-title  { height: 14px; width: 75%; }
    .sk-dest   { height: 11px; width: 50%; margin-bottom: 0.75rem; }
    .sk-meta   { display: flex; gap: 0.5rem; margin-bottom: 0.85rem; }
    .sk-tag    { height: 20px; width: 70px; border-radius: 4px; margin-bottom: 0; }
    .sk-footer { display: flex; justify-content: space-between; align-items: center; }
    .sk-price  { height: 16px; width: 90px; margin-bottom: 0; }
    .sk-btn    {
      height: 30px; width: 60px; border-radius: 5px;
      background: linear-gradient(90deg, #e8e4dc 25%, #f0ece4 50%, #e8e4dc 75%);
      background-size: 600px 100%;
      animation: shimmer 1.4s infinite linear;
    }
    .spinner {
      width: 40px; height: 40px;
      border: 3px solid #e0d8cc;
      border-top-color: #c8a96e;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 1rem;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .voyages-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.25rem; margin-bottom: 2rem; }
    .voyage-card {
      background: #fff;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(0,0,0,0.07);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .voyage-card:hover { transform: translateY(-3px); box-shadow: 0 6px 24px rgba(0,0,0,0.11); }
    .card-image {
      height: 180px;
      background: linear-gradient(135deg, #1a2f4e, #0a1628);
      position: relative;
      overflow: hidden;
    }
    .card-image img { width: 100%; height: 100%; object-fit: cover; }
    .card-placeholder {
      width: 100%; height: 100%;
      display: flex; align-items: center; justify-content: center;
      font-size: 2.5rem; color: rgba(200,169,110,0.3);
    }
    .card-type {
      position: absolute; bottom: 10px; left: 10px;
      background: rgba(10,22,40,0.8);
      color: #c8a96e;
      padding: 0.15rem 0.6rem;
      border-radius: 20px;
      font-size: 0.72rem;
      text-transform: capitalize;
    }
    .card-body { padding: 1.1rem; }
    .card-title { font-size: 1rem; font-weight: 700; color: #0a1628; margin: 0 0 0.3rem; font-family: 'Georgia', serif; }
    .card-dest { color: #c8a96e; font-size: 0.82rem; margin: 0 0 0.6rem; }
    .card-meta { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 0.85rem; }
    .card-meta span { font-size: 0.78rem; color: #888; background: #f5f3ee; padding: 0.2rem 0.5rem; border-radius: 4px; }
    .card-footer { display: flex; justify-content: space-between; align-items: center; }
    .card-price { font-size: 1.05rem; font-weight: 700; color: #0a1628; }
    .card-actions { display: flex; gap: 0.4rem; }
    .btn-view {
      background: #0a1628; color: #c8a96e;
      padding: 0.4rem 0.8rem; border-radius: 5px;
      text-decoration: none; font-size: 0.8rem; font-weight: 600;
      transition: background 0.2s;
    }
    .btn-view:hover { background: #1a2f4e; }
    .btn-edit {
      background: #f5f3ee; color: #555;
      padding: 0.4rem 0.6rem; border-radius: 5px;
      text-decoration: none; font-size: 0.85rem;
      transition: all 0.2s;
    }
    .btn-edit:hover { background: #e8e2d8; }
    .btn-delete {
      background: #fff0f0; color: #c0392b;
      padding: 0.4rem 0.6rem; border-radius: 5px;
      border: none; cursor: pointer; font-size: 0.85rem;
      transition: all 0.2s;
    }
    .btn-delete:hover { background: #fde8e8; }
    .empty-state {
      text-align: center; padding: 5rem 2rem; color: #999;
    }
    .empty-icon { font-size: 4rem; margin-bottom: 1rem; opacity: 0.3; }
    .empty-state h3 { color: #555; margin-bottom: 0.5rem; }
    .pagination { display: flex; justify-content: center; gap: 0.4rem; padding: 2rem 0; }
    .page-btn {
      width: 36px; height: 36px;
      border: 1px solid #e0d8cc;
      background: #fff;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.2s;
    }
    .page-btn:hover { border-color: #c8a96e; color: #c8a96e; }
    .page-btn.active { background: #c8a96e; color: #0a1628; border-color: #c8a96e; font-weight: 700; }
    .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  `],
})
export class VoyageListComponent implements OnInit {
  voyages: Voyage[] = [];
  destinations: Destination[] = [];
  loading = false;
  loadError = '';
  isAdmin = false;
  total = 0;
  currentPage = 1;
  pages = 1;

  filters: VoyageFilter = {
    search: '',
    destination: '',
    type: '',
    sortBy: '',
    page: 1,
    limit: 9,
  };

  constructor(
    private voyageService: VoyageService,
    private destinationService: DestinationService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.loadDestinations();
    this.loadVoyages();
  }

  loadDestinations(): void {
    this.destinationService.getAll().subscribe({
      next: (res) => {
        this.zone.run(() => {
          this.destinations = res.data as Destination[];
          this.cdr.markForCheck();
        });
      },
    });
  }

  loadVoyages(): void {
    this.loading = true;
    this.loadError = '';
    this.cdr.markForCheck();
    this.voyageService.getAll(this.filters).subscribe({
      next: (res) => {
        this.zone.run(() => {
          this.voyages = res.data as Voyage[];
          this.total = res.total || 0;
          this.pages = res.pages || 1;
          this.currentPage = res.page || 1;
          this.loading = false;
          this.cdr.markForCheck();
        });
      },
      error: (err) => {
        this.zone.run(() => {
          this.loadError = err.error?.message || 'Impossible de charger les voyages. Vérifiez que le serveur est démarré.';
          this.voyages = [];
          this.total = 0;
          this.loading = false;
          this.cdr.markForCheck();
        });
      },
    });
  }

  onFilterChange(): void {
    this.filters.page = 1;
    this.loadVoyages();
  }

  resetFilters(): void {
    this.filters = { search: '', destination: '', type: '', sortBy: '', page: 1, limit: 9 };
    this.loadVoyages();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.pages) return;
    this.filters.page = page;
    this.loadVoyages();
  }

  getPagesArray(): number[] {
    return Array.from({ length: this.pages }, (_, i) => i + 1);
  }

  deleteVoyage(voyage: Voyage): void {
    if (!confirm(`Supprimer le voyage "${voyage.titre}" ?`)) return;
    this.voyageService.delete(voyage._id!).subscribe({
      next: () => {
        this.voyages = this.voyages.filter((v) => v._id !== voyage._id);
        this.total--;
      },
      error: (err) => alert('Erreur lors de la suppression: ' + err.error?.message),
    });
  }

  getDestination(voyage: Voyage): any {
    return typeof voyage.destination === 'object' ? voyage.destination : null;
  }

  getImageUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('data:') || path.startsWith('http')) return path;
    return `http://localhost:4000${path}`;
  }
}
