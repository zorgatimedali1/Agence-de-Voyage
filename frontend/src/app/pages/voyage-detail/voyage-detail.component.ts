import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { VoyageService } from '../../services/voyage.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { Voyage } from '../../models/voyage.model';
import { Destination } from '../../models/destination.model';

@Component({
  selector: 'app-voyage-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="page">
      <div class="container">
        <div class="back-bar">
          <a routerLink="/voyages" class="back-link">← Retour aux voyages</a>
        </div>

        <div class="loading" *ngIf="loading">
          <div class="spinner"></div><p>Chargement...</p>
        </div>

        <div class="error-state" *ngIf="error && !loading">
          <h3>{{ error }}</h3>
          <a routerLink="/voyages" class="btn-back">Retour</a>
        </div>

        <div class="detail-layout" *ngIf="voyage && !loading">
          <!-- Hero image -->
          <div class="detail-hero">
            <img *ngIf="voyage.image" [src]="getImageUrl(voyage.image)" [alt]="voyage.titre" class="hero-img" />
            <div class="hero-placeholder" *ngIf="!voyage.image">✈</div>
            <span class="type-badge">{{ voyage.typeVoyage | titlecase }}</span>
          </div>

          <div class="detail-body">
            <!-- Main info -->
            <div class="detail-main">
              <div class="detail-header">
                <div>
                  <h1 class="detail-title">{{ voyage.titre }}</h1>
                  <p class="detail-dest" *ngIf="destination">
                    📍 {{ destination.nom }}, {{ destination.pays }}
                    <span class="climat-badge" *ngIf="destination.climat">{{ destination.climat }}</span>
                  </p>
                </div>
                <div class="detail-price">
                  <span class="price-amount">{{ voyage.prix | number:'1.0-0' }}</span>
                  <span class="price-currency">TND / personne</span>
                </div>
              </div>

              <div class="info-cards">
                <div class="info-card"><span class="info-icon">🗓</span><span class="info-label">Départ</span><span class="info-value">{{ voyage.dateDepart | date:'dd MMMM yyyy' }}</span></div>
                <div class="info-card"><span class="info-icon">🔄</span><span class="info-label">Retour</span><span class="info-value">{{ voyage.dateRetour | date:'dd MMMM yyyy' }}</span></div>
                <div class="info-card"><span class="info-icon">⏱</span><span class="info-label">Durée</span><span class="info-value">{{ voyage.duree }} jours</span></div>
                <div class="info-card"><span class="info-icon">👥</span><span class="info-label">Places dispo.</span><span class="info-value">{{ voyage.placesDisponibles }}</span></div>
              </div>

              <div class="section-block" *ngIf="voyage.description">
                <h2 class="block-title">Description</h2>
                <p class="block-text">{{ voyage.description }}</p>
              </div>

              <div class="section-block" *ngIf="voyage.inclus && voyage.inclus.length > 0">
                <h2 class="block-title">Ce qui est inclus</h2>
                <ul class="inclus-list">
                  <li *ngFor="let item of voyage.inclus">✓ {{ item }}</li>
                </ul>
              </div>

              <div class="section-block" *ngIf="destination">
                <h2 class="block-title">À propos de {{ destination.nom }}</h2>
                <p class="block-text" *ngIf="destination.description">{{ destination.description }}</p>
                <div class="dest-meta">
                  <span *ngIf="destination.langueLocale">🗣 {{ destination.langueLocale }}</span>
                  <span *ngIf="destination.monnaie">💰 {{ destination.monnaie }}</span>
                </div>
              </div>

              <!-- Admin edit actions -->
              <div class="detail-actions" *ngIf="isAdmin">
                <a [routerLink]="['/voyages', voyage._id, 'modifier']" class="btn-edit-main">✏ Modifier ce voyage</a>
                <a routerLink="/voyages" class="btn-back-main">Retour à la liste</a>
              </div>
            </div>

            <!-- Booking form -->
            <div class="booking-card">
              <h2 class="booking-title">Réserver ce voyage</h2>
              <p class="booking-price">{{ voyage.prix | number:'1.0-0' }} TND <span>/ personne</span></p>

              <div class="booking-success" *ngIf="bookingSuccess">
                <span class="success-icon">✅</span>
                <h3>Réservation envoyée !</h3>
                <p>Nous vous contacterons sous 24h pour confirmer votre réservation.</p>
                <button (click)="goToVoyages()" class="btn-new-booking">← Retour aux voyages</button>
              </div>

              <form [formGroup]="bookingForm" (ngSubmit)="onBook()" *ngIf="!bookingSuccess">
                <div formGroupName="client">
                  <div class="form-row">
                    <div class="form-group">
                      <label>Prénom *</label>
                      <input formControlName="prenom" type="text" class="form-input" placeholder="Mohamed" />
                      <span class="err" *ngIf="isInvalid('client.prenom')">Requis</span>
                    </div>
                    <div class="form-group">
                      <label>Nom *</label>
                      <input formControlName="nom" type="text" class="form-input" placeholder="Zorgati" />
                      <span class="err" *ngIf="isInvalid('client.nom')">Requis</span>
                    </div>
                  </div>
                  <div class="form-group">
                    <label>Email *</label>
                    <input formControlName="email" type="email" class="form-input" placeholder="email@exemple.com" />
                    <span class="err" *ngIf="isInvalid('client.email')">Email invalide</span>
                  </div>
                  <div class="form-group">
                    <label>Téléphone</label>
                    <input formControlName="telephone" type="tel" class="form-input" placeholder="+216 XX XXX XXX" />
                  </div>
                </div>

                <div class="form-group">
                  <label>Nombre de personnes *</label>
                  <input formControlName="nombrePersonnes" type="number" min="1" [max]="voyage.placesDisponibles" class="form-input" />
                  <span class="err" *ngIf="isInvalid('nombrePersonnes')">Min 1 personne</span>
                </div>

                <div class="form-group">
                  <label>Message (optionnel)</label>
                  <textarea formControlName="message" class="form-textarea" rows="3" placeholder="Demandes spéciales..."></textarea>
                </div>

                <div class="price-summary" *ngIf="(bookingForm.get('nombrePersonnes')?.value ?? 0) > 0">
                  <span>Total estimé</span>
                  <strong>{{ voyage.prix * (bookingForm.get('nombrePersonnes')?.value ?? 0) | number:'1.0-0' }} TND</strong>
                </div>

                <div class="booking-error" *ngIf="bookingError">{{ bookingError }}</div>

                <button type="submit" [disabled]="bookingLoading || bookingForm.invalid" class="btn-book">
                  {{ bookingLoading ? 'Envoi...' : 'Envoyer la réservation' }}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { background: #f8f6f0; min-height: 100vh; padding: 2rem 0; overflow-x: hidden; }
    .container { max-width: 1100px; margin: 0 auto; padding: 0 1.5rem; box-sizing: border-box; }
    .back-bar { margin-bottom: 1.5rem; }
    .back-link { color: #c8a96e; text-decoration: none; font-size: 0.9rem; font-weight: 600; }
    .loading { text-align: center; padding: 4rem; color: #888; }
    .spinner { width: 40px; height: 40px; border: 3px solid #e0d8cc; border-top-color: #c8a96e; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 1rem; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .error-state { text-align: center; padding: 4rem; }
    .detail-hero { border-radius: 12px; overflow: hidden; height: 360px; position: relative; background: linear-gradient(135deg, #1a2f4e, #0a1628); margin-bottom: 2rem; }
    .hero-img { width: 100%; height: 100%; object-fit: cover; }
    .hero-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 6rem; color: rgba(200,169,110,0.2); }
    .type-badge { position: absolute; top: 16px; right: 16px; background: rgba(200,169,110,0.9); color: #0a1628; padding: 0.3rem 1rem; border-radius: 20px; font-size: 0.85rem; font-weight: 700; }
    .detail-body { display: grid; grid-template-columns: 1fr 360px; gap: 2rem; align-items: start; min-width: 0; }
    .detail-main { background: #fff; border-radius: 12px; padding: 2rem; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .detail-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; gap: 1rem; }
    .detail-title { font-size: 1.6rem; font-family: 'Georgia', serif; color: #0a1628; margin: 0 0 0.4rem; }
    .detail-dest { color: #c8a96e; font-size: 0.9rem; margin: 0; }
    .climat-badge { background: #f5f3ee; color: #888; padding: 0.15rem 0.5rem; border-radius: 4px; font-size: 0.75rem; margin-left: 0.5rem; }
    .detail-price { text-align: right; flex-shrink: 0; }
    .price-amount { display: block; font-size: 1.8rem; font-weight: 700; color: #0a1628; font-family: 'Georgia', serif; }
    .price-currency { font-size: 0.8rem; color: #888; }
    .info-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; margin-bottom: 1.5rem; }
    .info-card { background: #f8f6f0; border-radius: 8px; padding: 0.85rem; text-align: center; display: flex; flex-direction: column; gap: 0.25rem; }
    .info-icon { font-size: 1.2rem; }
    .info-label { font-size: 0.68rem; color: #888; text-transform: uppercase; letter-spacing: 0.05em; }
    .info-value { font-size: 0.85rem; font-weight: 600; color: #0a1628; }
    .section-block { margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid #f0ece5; }
    .block-title { font-size: 1rem; font-family: 'Georgia', serif; color: #0a1628; margin: 0 0 0.6rem; }
    .block-text { color: #555; line-height: 1.75; margin: 0; font-size: 0.9rem; }
    .inclus-list { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.35rem; }
    .inclus-list li { color: #444; font-size: 0.88rem; padding: 0.25rem 0; }
    .dest-meta { display: flex; gap: 1.5rem; margin-top: 0.5rem; font-size: 0.88rem; color: #666; }
    .detail-actions { display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 1rem; }
    .btn-edit-main { background: #c8a96e; color: #0a1628; padding: 0.7rem 1.25rem; border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 0.88rem; }
    .btn-back-main { background: #f5f3ee; color: #555; padding: 0.7rem 1.25rem; border-radius: 6px; text-decoration: none; font-size: 0.88rem; }
    /* Booking card */
    .booking-card { background: #fff; border-radius: 12px; padding: 1.75rem; box-shadow: 0 4px 20px rgba(0,0,0,0.08); position: sticky; top: 90px; max-width: 100%; overflow: hidden; }
    .booking-title { font-size: 1.1rem; font-family: 'Georgia', serif; color: #0a1628; margin: 0 0 0.25rem; }
    .booking-price { font-size: 1.4rem; font-weight: 700; color: #c8a96e; margin: 0 0 1.5rem; }
    .booking-price span { font-size: 0.8rem; color: #888; font-weight: 400; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; min-width: 0; }
    .form-row .form-group { min-width: 0; }
    .form-row .form-input { width: 100%; box-sizing: border-box; }
    .form-group { margin-bottom: 0.9rem; display: flex; flex-direction: column; gap: 0.3rem; }
    label { font-size: 0.8rem; font-weight: 600; color: #444; }
    .form-input, .form-textarea { padding: 0.6rem 0.8rem; border: 1px solid #e0d8cc; border-radius: 6px; font-size: 0.88rem; outline: none; transition: border-color 0.2s; font-family: inherit; width: 100%; box-sizing: border-box; }
    .form-input:focus, .form-textarea:focus { border-color: #c8a96e; }
    .form-textarea { resize: vertical; }
    .err { font-size: 0.75rem; color: #e74c3c; }
    .price-summary { display: flex; justify-content: space-between; align-items: center; background: #f8f6f0; padding: 0.75rem 1rem; border-radius: 6px; margin-bottom: 1rem; font-size: 0.9rem; color: #555; }
    .price-summary strong { color: #0a1628; font-size: 1.05rem; }
    .booking-error { background: #fde8e8; color: #c0392b; padding: 0.6rem 0.8rem; border-radius: 6px; font-size: 0.82rem; margin-bottom: 0.75rem; }
    .btn-book { width: 100%; background: #c8a96e; color: #0a1628; padding: 0.85rem; border: none; border-radius: 8px; font-size: 0.95rem; font-weight: 700; font-family: 'Georgia', serif; cursor: pointer; transition: all 0.2s; }
    .btn-book:hover:not(:disabled) { background: #d4b87e; }
    .btn-book:disabled { opacity: 0.6; cursor: not-allowed; }
    .booking-success { text-align: center; padding: 1.5rem 0; }
    .success-icon { font-size: 2.5rem; display: block; margin-bottom: 0.75rem; }
    .booking-success h3 { color: #0a1628; font-family: 'Georgia', serif; margin: 0 0 0.5rem; }
    .booking-success p { color: #666; font-size: 0.88rem; line-height: 1.6; margin: 0 0 1.25rem; }
    .btn-new-booking { background: #f5f3ee; color: #555; border: none; padding: 0.6rem 1.25rem; border-radius: 6px; cursor: pointer; font-size: 0.88rem; }
    @media (max-width: 900px) {
      .detail-body { grid-template-columns: 1fr; }
      .booking-card { position: static; }
      .info-cards { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 480px) {
      .form-row { grid-template-columns: 1fr; }
      .booking-card { padding: 1.25rem; }
    }
  `],
})
export class VoyageDetailComponent implements OnInit {
  voyage: Voyage | null = null;
  destination: Destination | null = null;
  loading = true;
  error = '';
  isAdmin = false;
  bookingSuccess = false;
  bookingLoading = false;
  bookingError = '';

  bookingForm = this.fb.group({
    client: this.fb.group({
      prenom: ['', Validators.required],
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: [''],
    }),
    nombrePersonnes: [1, [Validators.required, Validators.min(1)]],
    message: [''],
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private voyageService: VoyageService,
    private orderService: OrderService,
    private authService: AuthService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.voyageService.getById(id).subscribe({
        next: (res) => {
          this.zone.run(() => {
            this.voyage = res.data as Voyage;
            if (typeof this.voyage.destination === 'object') {
              this.destination = this.voyage.destination as unknown as Destination;
            }
            this.loading = false;
            this.cdr.markForCheck();
          });
        },
        error: (err) => {
          this.zone.run(() => {
            this.error = err.error?.message || 'Voyage introuvable';
            this.loading = false;
            this.cdr.markForCheck();
          });
        },
      });
    }
  }

  isInvalid(path: string): boolean {
    const ctrl = this.bookingForm.get(path);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  onBook(): void {
    if (this.bookingForm.invalid) { this.bookingForm.markAllAsTouched(); return; }
    this.bookingLoading = true;
    this.bookingError = '';
    const val = this.bookingForm.value;
    const payload = {
      voyage: this.voyage!._id,
      client: val.client,
      nombrePersonnes: val.nombrePersonnes,
      message: val.message,
    };
    this.orderService.create(payload as any).subscribe({
      next: () => {
        this.zone.run(() => {
          this.bookingLoading = false;
          this.bookingSuccess = true;
          this.cdr.markForCheck();
        });
      },
      error: (err) => {
        this.zone.run(() => {
          this.bookingLoading = false;
          this.bookingError = err.error?.message || 'Erreur lors de la réservation';
          this.cdr.markForCheck();
        });
      },
    });
  }

  resetBooking(): void {
    this.bookingSuccess = false;
    this.bookingForm.reset({ nombrePersonnes: 1 });
  }

  goToVoyages(): void {
    this.router.navigate(['/voyages']);
  }

  getImageUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('data:') || path.startsWith('http')) return path;
    return `http://localhost:4000${path}`;
  }
}
