import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order.model';
import { Voyage } from '../../models/voyage.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div class="container">
          <div>
            <h1 class="page-title">Tableau de Bord Admin</h1>
            <p class="page-sub">Gestion des réservations et du contenu</p>
          </div>
          <div class="header-actions">
            <a routerLink="/voyages/nouveau" class="btn-action">+ Nouveau Voyage</a>
            <a routerLink="/destinations/nouveau" class="btn-action-outline">+ Destination</a>
          </div>
        </div>
      </div>

      <div class="container">
        <!-- Stats -->
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-icon">📋</span>
            <div>
              <span class="stat-num">{{ stats.total }}</span>
              <span class="stat-label">Total réservations</span>
            </div>
          </div>
          <div class="stat-card pending">
            <span class="stat-icon">⏳</span>
            <div>
              <span class="stat-num">{{ stats.enAttente }}</span>
              <span class="stat-label">En attente</span>
            </div>
          </div>
          <div class="stat-card confirmed">
            <span class="stat-icon">✅</span>
            <div>
              <span class="stat-num">{{ stats.confirmees }}</span>
              <span class="stat-label">Confirmées</span>
            </div>
          </div>
          <div class="stat-card cancelled">
            <span class="stat-icon">❌</span>
            <div>
              <span class="stat-num">{{ stats.annulees }}</span>
              <span class="stat-label">Annulées</span>
            </div>
          </div>
        </div>

        <!-- Quick links -->
        <div class="quick-links">
          <a routerLink="/voyages" class="quick-link">
            <span>✈</span> Gérer les Voyages
          </a>
          <a routerLink="/destinations" class="quick-link">
            <span>🌍</span> Gérer les Destinations
          </a>
        </div>

        <!-- Orders section -->
        <div class="section-header">
          <h2 class="section-title">Réservations</h2>
          <div class="filter-tabs">
            <button *ngFor="let f of statusFilters" (click)="setFilter(f.value)"
              [class.active]="activeFilter === f.value" class="tab-btn">
              {{ f.label }}
            </button>
          </div>
        </div>

        <div class="loading" *ngIf="loading">
          <div class="spinner"></div><p>Chargement...</p>
        </div>

        <div class="orders-table-wrap" *ngIf="!loading && orders.length > 0">
          <table class="orders-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Voyage</th>
                <th>Personnes</th>
                <th>Prix total</th>
                <th>Date</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let order of orders">
                <td>
                  <strong>{{ order.client.prenom }} {{ order.client.nom }}</strong><br>
                  <small>{{ order.client.email }}</small><br>
                  <small *ngIf="order.client.telephone">{{ order.client.telephone }}</small>
                </td>
                <td>{{ getVoyageTitre(order) }}</td>
                <td class="center">{{ order.nombrePersonnes }}</td>
                <td class="price">{{ order.prixTotal | number:'1.0-0' }} TND</td>
                <td>{{ order.createdAt | date:'dd/MM/yyyy' }}</td>
                <td>
                  <span class="badge" [class]="'badge-' + order.statut">
                    {{ statutLabel(order.statut) }}
                  </span>
                </td>
                <td>
                  <div class="action-btns">
                    <button *ngIf="order.statut === 'en_attente'" (click)="updateStatut(order, 'confirmée')" class="btn-confirm">✓ Confirmer</button>
                    <button *ngIf="order.statut === 'en_attente'" (click)="updateStatut(order, 'annulée')" class="btn-cancel">✗ Annuler</button>
                    <button *ngIf="order.statut !== 'en_attente'" (click)="updateStatut(order, 'en_attente')" class="btn-reset">↺ Remettre</button>
                    <button (click)="deleteOrder(order)" class="btn-delete">🗑</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="empty-state" *ngIf="!loading && orders.length === 0">
          <div class="empty-icon">📋</div>
          <h3>Aucune réservation {{ activeFilter !== 'all' ? 'dans cette catégorie' : '' }}</h3>
        </div>

        <!-- Pagination -->
        <div class="pagination" *ngIf="pages > 1">
          <button (click)="changePage(currentPage - 1)" [disabled]="currentPage === 1" class="page-btn">‹</button>
          <button *ngFor="let p of getPagesArray()" (click)="changePage(p)" [class.active]="p === currentPage" class="page-btn">{{ p }}</button>
          <button (click)="changePage(currentPage + 1)" [disabled]="currentPage === pages" class="page-btn">›</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { background: #f8f6f0; min-height: 100vh; }
    .page-header { background: #0a1628; padding: 2rem 0; margin-bottom: 2rem; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }
    .page-header .container { display: flex; justify-content: space-between; align-items: center; }
    .page-title { color: #fff; font-size: 1.8rem; font-family: 'Georgia', serif; margin: 0 0 0.25rem; }
    .page-sub { color: #90a4ae; font-size: 0.85rem; margin: 0; }
    .header-actions { display: flex; gap: 0.75rem; }
    .btn-action { background: #c8a96e; color: #0a1628; padding: 0.6rem 1.2rem; border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 0.85rem; }
    .btn-action-outline { border: 1px solid #c8a96e; color: #c8a96e; padding: 0.6rem 1.2rem; border-radius: 6px; text-decoration: none; font-size: 0.85rem; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
    .stat-card { background: #fff; border-radius: 10px; padding: 1.25rem; display: flex; align-items: center; gap: 1rem; box-shadow: 0 2px 10px rgba(0,0,0,0.06); border-left: 4px solid #c8a96e; }
    .stat-card.pending { border-left-color: #f39c12; }
    .stat-card.confirmed { border-left-color: #27ae60; }
    .stat-card.cancelled { border-left-color: #e74c3c; }
    .stat-icon { font-size: 1.8rem; }
    .stat-num { display: block; font-size: 1.8rem; font-weight: 700; color: #0a1628; font-family: 'Georgia', serif; }
    .stat-label { font-size: 0.78rem; color: #888; text-transform: uppercase; letter-spacing: 0.05em; }
    .quick-links { display: flex; gap: 1rem; margin-bottom: 2rem; }
    .quick-link { background: #fff; border: 1px solid #e0d8cc; border-radius: 8px; padding: 0.85rem 1.5rem; text-decoration: none; color: #0a1628; font-weight: 600; font-size: 0.9rem; display: flex; align-items: center; gap: 0.5rem; transition: all 0.2s; }
    .quick-link:hover { border-color: #c8a96e; color: #c8a96e; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
    .section-title { font-size: 1.3rem; font-family: 'Georgia', serif; color: #0a1628; margin: 0; }
    .filter-tabs { display: flex; gap: 0.4rem; }
    .tab-btn { padding: 0.4rem 0.9rem; border: 1px solid #e0d8cc; background: #fff; border-radius: 20px; cursor: pointer; font-size: 0.82rem; color: #666; transition: all 0.2s; }
    .tab-btn.active { background: #0a1628; color: #c8a96e; border-color: #0a1628; }
    .loading { text-align: center; padding: 3rem; color: #888; }
    .spinner { width: 36px; height: 36px; border: 3px solid #e0d8cc; border-top-color: #c8a96e; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 1rem; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .orders-table-wrap { background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.06); margin-bottom: 1.5rem; overflow-x: auto; }
    .orders-table { width: 100%; border-collapse: collapse; }
    .orders-table th { background: #0a1628; color: #c8a96e; padding: 0.85rem 1rem; text-align: left; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap; }
    .orders-table td { padding: 0.85rem 1rem; border-bottom: 1px solid #f0ece5; font-size: 0.88rem; color: #333; vertical-align: middle; }
    .orders-table td small { color: #888; font-size: 0.78rem; }
    .orders-table tr:last-child td { border-bottom: none; }
    .orders-table tr:hover td { background: #fafaf8; }
    .center { text-align: center; }
    .price { font-weight: 700; color: #0a1628; }
    .badge { padding: 0.25rem 0.7rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
    .badge-en_attente { background: #fff3cd; color: #856404; }
    .badge-confirmée { background: #d1e7dd; color: #0f5132; }
    .badge-annulée { background: #f8d7da; color: #842029; }
    .action-btns { display: flex; gap: 0.35rem; flex-wrap: wrap; }
    .btn-confirm { background: #d1e7dd; color: #0f5132; border: none; padding: 0.3rem 0.6rem; border-radius: 4px; cursor: pointer; font-size: 0.78rem; font-weight: 600; }
    .btn-cancel { background: #f8d7da; color: #842029; border: none; padding: 0.3rem 0.6rem; border-radius: 4px; cursor: pointer; font-size: 0.78rem; font-weight: 600; }
    .btn-reset { background: #fff3cd; color: #856404; border: none; padding: 0.3rem 0.6rem; border-radius: 4px; cursor: pointer; font-size: 0.78rem; }
    .btn-delete { background: #fff0f0; color: #c0392b; border: none; padding: 0.3rem 0.5rem; border-radius: 4px; cursor: pointer; font-size: 0.82rem; }
    .empty-state { text-align: center; padding: 4rem; color: #999; }
    .empty-icon { font-size: 3rem; margin-bottom: 1rem; opacity: 0.3; }
    .empty-state h3 { color: #555; }
    .pagination { display: flex; justify-content: center; gap: 0.4rem; padding: 1.5rem 0; }
    .page-btn { width: 34px; height: 34px; border: 1px solid #e0d8cc; background: #fff; border-radius: 6px; cursor: pointer; font-size: 0.9rem; }
    .page-btn.active { background: #c8a96e; color: #0a1628; border-color: #c8a96e; font-weight: 700; }
    .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    @media (max-width: 768px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
  `],
})
export class AdminDashboardComponent implements OnInit {
  orders: Order[] = [];
  loading = false;
  activeFilter = 'all';
  currentPage = 1;
  pages = 1;
  stats = { total: 0, enAttente: 0, confirmees: 0, annulees: 0 };

  statusFilters = [
    { label: 'Toutes', value: 'all' },
    { label: 'En attente', value: 'en_attente' },
    { label: 'Confirmées', value: 'confirmée' },
    { label: 'Annulées', value: 'annulée' },
  ];

  constructor(private orderService: OrderService, private cdr: ChangeDetectorRef, private zone: NgZone) {}

  ngOnInit(): void { this.loadOrders(); }

  loadOrders(): void {
    this.loading = true;
    const statut = this.activeFilter === 'all' ? undefined : this.activeFilter;
    this.orderService.getAll(statut, this.currentPage).subscribe({
      next: (res) => {
        this.zone.run(() => {
          this.orders = res.data as Order[];
          this.pages = res.pages || 1;
          this.computeStats();
          this.loading = false;
          this.cdr.markForCheck();
        });
      },
      error: () => { this.zone.run(() => { this.loading = false; this.cdr.markForCheck(); }); },
    });
  }

  computeStats(): void {
    if (this.activeFilter === 'all') {
      this.stats.total = this.orders.length;
      this.stats.enAttente = this.orders.filter(o => o.statut === 'en_attente').length;
      this.stats.confirmees = this.orders.filter(o => o.statut === 'confirmée').length;
      this.stats.annulees = this.orders.filter(o => o.statut === 'annulée').length;
    }
  }

  setFilter(f: string): void { this.activeFilter = f; this.currentPage = 1; this.loadOrders(); }
  changePage(p: number): void { if (p < 1 || p > this.pages) return; this.currentPage = p; this.loadOrders(); }
  getPagesArray(): number[] { return Array.from({ length: this.pages }, (_, i) => i + 1); }

  updateStatut(order: Order, statut: string): void {
    this.orderService.updateStatut(order._id!, statut).subscribe({
      next: (res) => {
        this.zone.run(() => {
          const idx = this.orders.findIndex(o => o._id === order._id);
          if (idx !== -1) this.orders[idx] = res.data as Order;
          this.computeStats();
          this.cdr.markForCheck();
        });
      },
    });
  }

  deleteOrder(order: Order): void {
    if (!confirm(`Supprimer la réservation de ${order.client.prenom} ${order.client.nom} ?`)) return;
    this.orderService.delete(order._id!).subscribe({
      next: () => {
        this.zone.run(() => {
          this.orders = this.orders.filter(o => o._id !== order._id);
          this.computeStats();
          this.cdr.markForCheck();
        });
      },
    });
  }

  getVoyageTitre(order: Order): string {
    return typeof order.voyage === 'object' ? (order.voyage as any).titre : '—';
  }

  statutLabel(s: string): string {
    return { en_attente: 'En attente', confirmée: 'Confirmée', annulée: 'Annulée' }[s] || s;
  }
}
