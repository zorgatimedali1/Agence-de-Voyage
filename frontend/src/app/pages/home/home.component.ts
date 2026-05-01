import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { VoyageService } from '../../services/voyage.service';
import { DestinationService } from '../../services/destination.service';
import { AuthService } from '../../services/auth.service';
import { Voyage } from '../../models/voyage.model';
import { Destination } from '../../models/destination.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- Hero Section -->
    <section class="hero">
      <!-- Carousel backgrounds -->
      <div class="carousel-track">
        <div
          class="carousel-slide"
          *ngFor="let slide of slides; let i = index"
          [class.active]="i === currentSlide"
          [class.prev]="i === prevSlide"
          [style.backgroundImage]="'url(' + slide.img + ')'"
        ></div>
      </div>
      <div class="carousel-overlay"></div>

      <!-- Slide label -->
      <div class="carousel-label">
        <span class="cl-icon">📍</span>
        <span>{{ slides[currentSlide].name }}</span>
      </div>

      <!-- Dot indicators -->
      <div class="carousel-dots">
        <button
          *ngFor="let slide of slides; let i = index"
          class="dot"
          [class.active]="i === currentSlide"
          (click)="goToSlide(i)"
        ></button>
      </div>

      <!-- Arrow controls -->
      <button class="carousel-arrow arrow-prev" (click)="prevSlideClick()">&#8249;</button>
      <button class="carousel-arrow arrow-next" (click)="nextSlideClick()">&#8250;</button>

      <!-- Content -->
      <div class="hero-content">
        <p class="hero-tagline">Agence de Voyage Premium</p>
        <h1 class="hero-title">
          Découvrez le Monde<br>
          <span class="hero-accent">Avec Zorgati</span>
        </h1>
        <p class="hero-desc">Des expériences uniques, des destinations inoubliables. Laissez-nous créer le voyage de vos rêves.</p>
        <div class="hero-actions">
          <a routerLink="/voyages" class="btn-primary">Explorer nos voyages</a>
          <a routerLink="/destinations" class="btn-secondary">Voir les destinations</a>
        </div>
      </div>
      <div class="hero-stats">
        <div class="stat">
          <span class="stat-number">{{ displayVoyages }}</span>
          <span class="stat-label">Voyages disponibles</span>
        </div>
        <div class="stat">
          <span class="stat-number">{{ displayDestinations }}</span>
          <span class="stat-label">Destinations</span>
        </div>
        <div class="stat">
          <span class="stat-number">{{ displaySatisfaction }}%</span>
          <span class="stat-label">Satisfaction client</span>
        </div>
      </div>
    </section>

    <!-- Featured Voyages -->
    <section class="featured-section">
      <div class="container">
        <div class="featured-header">
          <div class="featured-label">✦ Sélection du moment</div>
          <h2 class="featured-title">Voyages à la Une</h2>
          <p class="featured-sub">Les 3 prochains départs — réservez avant qu'il ne soit trop tard</p>
          <a routerLink="/voyages" class="featured-link">Voir tous les voyages →</a>
        </div>

        <!-- Skeleton while loading -->
        <div class="featured-grid" *ngIf="loadingFeatured">
          <div class="sk-featured-card sk-large"></div>
          <div class="sk-featured-card"></div>
          <div class="sk-featured-card"></div>
        </div>

        <div class="featured-grid" *ngIf="!loadingFeatured && featuredVoyages.length > 0; else noVoyages">          <div class="featured-card" *ngFor="let voyage of featuredVoyages; let i = index" [class.card-large]="i === 0">

            <!-- Background image / placeholder -->
            <div class="fc-bg">
              <img *ngIf="voyage.image" [src]="getImageUrl(voyage.image)" [alt]="voyage.titre" />
              <div class="fc-bg-placeholder" *ngIf="!voyage.image">
                <span class="fc-plane">✈</span>
              </div>
              <div class="fc-overlay"></div>
            </div>

            <!-- Top badges -->
            <div class="fc-top">
              <span class="fc-type">{{ voyage.typeVoyage | titlecase }}</span>
              <span class="fc-places" *ngIf="voyage.placesDisponibles <= 10">🔥 {{ voyage.placesDisponibles }} places</span>
            </div>

            <!-- Bottom content -->
            <div class="fc-content">
              <p class="fc-dest" *ngIf="getDestination(voyage)">
                📍 {{ getDestination(voyage)?.nom }}, {{ getDestination(voyage)?.pays }}
              </p>
              <h3 class="fc-title">{{ voyage.titre }}</h3>
              <div class="fc-meta">
                <span>🗓 {{ voyage.dateDepart | date:'dd MMM yyyy' }}</span>
                <span>⏱ {{ voyage.duree }} jours</span>
              </div>
              <div class="fc-footer">
                <div class="fc-price">
                  <span class="fc-price-amount">{{ voyage.prix | number:'1.0-0' }}</span>
                  <span class="fc-price-unit">TND / pers.</span>
                </div>
                <a [routerLink]="['/voyages', voyage._id]" class="fc-btn">Réserver</a>
              </div>
            </div>
          </div>
        </div>

        <ng-template #noVoyages>
          <div class="empty-state" *ngIf="!loadingFeatured">
            <p>Aucun voyage disponible pour le moment.</p>
            <a *ngIf="isAdmin" routerLink="/voyages/nouveau" class="btn-primary">Ajouter un voyage</a>
          </div>
        </ng-template>      </div>
    </section>

    <!-- Types de voyages -->
    <section class="section types-section">
      <div class="container">
        <h2 class="section-title">Types de Voyages</h2>
        <div class="types-grid">
          <div class="type-card" *ngFor="let type of types">
            <span class="type-icon">{{ type.icon }}</span>
            <h3>{{ type.label }}</h3>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    /* ── Hero Carousel ── */
    .hero {
      position: relative;
      color: white;
      padding: 5rem 2rem 4rem;
      min-height: 88vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      overflow: hidden;
    }
    /* Carousel track */
    .carousel-track { position: absolute; inset: 0; }
    .carousel-slide {
      position: absolute; inset: 0;
      background-size: cover;
      background-position: center;
      opacity: 0;
      transform: scale(1.04);
      transition: opacity 1.2s ease, transform 6s ease;
    }
    .carousel-slide.active {
      opacity: 1;
      transform: scale(1);
      z-index: 1;
    }
    .carousel-slide.prev {
      opacity: 0;
      z-index: 0;
    }
    /* Dark gradient overlay */
    .carousel-overlay {
      position: absolute; inset: 0; z-index: 2;
      background: linear-gradient(
        to bottom,
        rgba(10,22,40,0.55) 0%,
        rgba(10,22,40,0.45) 50%,
        rgba(10,22,40,0.75) 100%
      );
    }
    /* Location label bottom-left */
    .carousel-label {
      position: absolute; bottom: 7rem; left: 2rem;
      z-index: 10;
      display: flex; align-items: center; gap: 0.4rem;
      background: rgba(10,22,40,0.55);
      backdrop-filter: blur(6px);
      border: 1px solid rgba(200,169,110,0.3);
      color: #c8a96e;
      padding: 0.35rem 0.9rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-family: 'Georgia', serif;
      letter-spacing: 0.05em;
      transition: opacity 0.5s;
    }
    /* Dot indicators */
    .carousel-dots {
      position: absolute; bottom: 2rem; left: 50%; transform: translateX(-50%);
      z-index: 10; display: flex; gap: 0.5rem;
    }
    .dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      border: none;
      background: rgba(255,255,255,0.35);
      cursor: pointer;
      transition: all 0.3s;
      padding: 0;
    }
    .dot.active { background: #c8a96e; width: 24px; border-radius: 4px; }
    /* Arrow controls */
    .carousel-arrow {
      position: absolute; top: 50%; transform: translateY(-50%);
      z-index: 10;
      background: rgba(10,22,40,0.45);
      backdrop-filter: blur(4px);
      border: 1px solid rgba(200,169,110,0.25);
      color: #c8a96e;
      width: 44px; height: 44px;
      border-radius: 50%;
      font-size: 1.6rem;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
      line-height: 1;
    }
    .carousel-arrow:hover { background: rgba(200,169,110,0.25); border-color: #c8a96e; }
    .arrow-prev { left: 1.5rem; }
    .arrow-next { right: 1.5rem; }
    /* Hero content */
    .hero-content { position: relative; z-index: 5; max-width: 700px; }
    .hero-tagline {
      color: #c8a96e;
      font-size: 0.85rem;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      margin-bottom: 1rem;
      font-family: 'Georgia', serif;
    }
    .hero-title {
      font-size: clamp(2.5rem, 5vw, 4rem);
      font-family: 'Georgia', serif;
      font-weight: 700;
      line-height: 1.15;
      margin-bottom: 1.5rem;
      text-shadow: 0 2px 20px rgba(0,0,0,0.4);
    }
    .hero-accent { color: #c8a96e; }
    .hero-desc { color: rgba(255,255,255,0.8); font-size: 1.1rem; line-height: 1.7; margin-bottom: 2.5rem; text-shadow: 0 1px 8px rgba(0,0,0,0.3); }
    .hero-actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
    .btn-primary {
      background: #c8a96e; color: #0a1628;
      padding: 0.85rem 2rem; border-radius: 6px;
      text-decoration: none; font-weight: 700; font-size: 0.95rem;
      transition: all 0.2s; font-family: 'Georgia', serif;
    }
    .btn-primary:hover { background: #d4b87e; transform: translateY(-2px); }
    .btn-secondary {
      border: 1px solid rgba(200,169,110,0.5); color: #c8a96e;
      padding: 0.85rem 2rem; border-radius: 6px;
      text-decoration: none; font-weight: 600; transition: all 0.2s;
      backdrop-filter: blur(4px);
    }
    .btn-secondary:hover { background: rgba(200,169,110,0.15); }
    .hero-stats {
      display: flex; gap: 3rem; margin-top: 4rem;
      position: relative; z-index: 5;
    }
    .stat { text-align: center; }
    .stat-number { display: block; font-size: 2.2rem; font-weight: 700; color: #c8a96e; font-family: 'Georgia', serif; }
    .stat-label { font-size: 0.8rem; color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 0.1em; }
    .section { padding: 5rem 0; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; }
    .section-title {
      font-size: 2rem;
      font-family: 'Georgia', serif;
      color: #0a1628;
      font-weight: 700;
    }
    .section-link { color: #c8a96e; text-decoration: none; font-weight: 600; }
    .voyages-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
    .voyage-card {
      background: #fff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .voyage-card:hover { transform: translateY(-4px); box-shadow: 0 8px 30px rgba(0,0,0,0.12); }
    .card-image {
      height: 200px;
      background: linear-gradient(135deg, #1a2f4e, #0a1628);
      position: relative;
      overflow: hidden;
    }
    .card-image img { width: 100%; height: 100%; object-fit: cover; }
    .card-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3rem;
      color: rgba(200,169,110,0.4);
    }
    .card-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      background: rgba(200,169,110,0.9);
      color: #0a1628;
      padding: 0.2rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 700;
    }
    .card-body { padding: 1.25rem; }
    .card-title { font-size: 1.1rem; font-weight: 700; color: #0a1628; margin: 0 0 0.4rem; font-family: 'Georgia', serif; }
    .card-dest { color: #c8a96e; font-size: 0.85rem; margin: 0 0 0.6rem; }
    .card-desc { color: #666; font-size: 0.9rem; line-height: 1.5; margin: 0 0 1rem; }
    .card-footer { display: flex; justify-content: space-between; align-items: center; }
    .card-info { display: flex; flex-direction: column; }
    .card-price { font-size: 1.15rem; font-weight: 700; color: #0a1628; }
    .card-duration { font-size: 0.8rem; color: #999; }
    .card-btn {
      background: #0a1628;
      color: #c8a96e;
      padding: 0.5rem 1.1rem;
      border-radius: 6px;
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 600;
      transition: all 0.2s;
    }
    .card-btn:hover { background: #1a2f4e; }
    /* ── Featured Section ── */
    .featured-section { padding: 5rem 0; background: #f8f6f0; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }
    .featured-header { text-align: center; margin-bottom: 3rem; }
    .featured-label { color: #c8a96e; font-size: 0.78rem; letter-spacing: 0.25em; text-transform: uppercase; margin-bottom: 0.6rem; font-family: 'Georgia', serif; }
    .featured-title { font-size: 2.4rem; font-family: 'Georgia', serif; color: #0a1628; margin: 0 0 0.6rem; font-weight: 700; }
    .featured-sub { color: #888; font-size: 0.95rem; margin: 0 0 1.25rem; }
    .featured-link { color: #c8a96e; text-decoration: none; font-weight: 600; font-size: 0.9rem; border-bottom: 1px solid rgba(200,169,110,0.4); padding-bottom: 2px; transition: border-color 0.2s; }
    .featured-link:hover { border-color: #c8a96e; }

    /* Grid: first card is large, other two stack on the right */
    .featured-grid {
      display: grid;
      grid-template-columns: 1.6fr 1fr;
      grid-template-rows: auto auto;
      gap: 1.25rem;
    }
    .featured-card {
      position: relative;
      border-radius: 16px;
      overflow: hidden;
      min-height: 280px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      cursor: pointer;
      transition: transform 0.3s, box-shadow 0.3s;
    }
    .featured-card:hover { transform: translateY(-5px); box-shadow: 0 16px 48px rgba(10,22,40,0.25); }

    /* First card spans both rows */
    .featured-card.card-large { grid-row: span 2; min-height: 580px; }

    /* Background */
    .fc-bg { position: absolute; inset: 0; }
    .fc-bg img { width: 100%; height: 100%; object-fit: cover; }
    .fc-bg-placeholder {
      width: 100%; height: 100%;
      background: linear-gradient(135deg, #1a2f4e 0%, #0a1628 100%);
      display: flex; align-items: center; justify-content: center;
    }
    .fc-plane { font-size: 5rem; color: rgba(200,169,110,0.15); }
    .fc-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(10,22,40,0.92) 0%, rgba(10,22,40,0.3) 50%, transparent 100%);
    }

    /* Top badges */
    .fc-top { position: relative; z-index: 2; display: flex; justify-content: space-between; align-items: flex-start; padding: 1.25rem 1.25rem 0; }
    .fc-type { background: rgba(200,169,110,0.9); color: #0a1628; padding: 0.2rem 0.75rem; border-radius: 20px; font-size: 0.72rem; font-weight: 700; text-transform: capitalize; }
    .fc-places { background: rgba(231,76,60,0.85); color: #fff; padding: 0.2rem 0.65rem; border-radius: 20px; font-size: 0.72rem; font-weight: 700; }

    /* Bottom content */
    .fc-content { position: relative; z-index: 2; padding: 1.25rem; }
    .fc-dest { color: rgba(200,169,110,0.85); font-size: 0.78rem; margin: 0 0 0.3rem; letter-spacing: 0.03em; }
    .fc-title { color: #fff; font-family: 'Georgia', serif; font-size: 1.15rem; font-weight: 700; margin: 0 0 0.6rem; line-height: 1.3; }
    .card-large .fc-title { font-size: 1.6rem; }
    .fc-meta { display: flex; gap: 1rem; margin-bottom: 1rem; }
    .fc-meta span { color: rgba(255,255,255,0.7); font-size: 0.78rem; }
    .fc-footer { display: flex; justify-content: space-between; align-items: center; }
    .fc-price { display: flex; flex-direction: column; }
    .fc-price-amount { color: #c8a96e; font-size: 1.3rem; font-weight: 700; font-family: 'Georgia', serif; line-height: 1; }
    .card-large .fc-price-amount { font-size: 1.7rem; }
    .fc-price-unit { color: rgba(255,255,255,0.5); font-size: 0.72rem; }
    .fc-btn {
      background: #c8a96e; color: #0a1628;
      padding: 0.55rem 1.25rem; border-radius: 6px;
      text-decoration: none; font-weight: 700; font-size: 0.85rem;
      transition: all 0.2s; white-space: nowrap;
    }
    .fc-btn:hover { background: #d4b87e; transform: translateY(-1px); }
    .card-large .fc-btn { padding: 0.7rem 1.75rem; font-size: 0.95rem; }

    .empty-state { text-align: center; padding: 3rem; color: #999; }
    /* ── Featured skeletons ── */
    @keyframes shimmer {
      0%   { background-position: -800px 0; }
      100% { background-position: 800px 0; }
    }
    .sk-featured-card {
      border-radius: 16px;
      min-height: 280px;
      background: linear-gradient(90deg, #ddd8ce 25%, #e8e4dc 50%, #ddd8ce 75%);
      background-size: 800px 100%;
      animation: shimmer 1.5s infinite linear;
    }
    .sk-featured-card.sk-large { grid-row: span 2; min-height: 580px; }
    @media (max-width: 768px) {
      .sk-featured-card.sk-large { grid-row: span 1; min-height: 280px; }
    }

    @media (max-width: 768px) {
      .featured-grid { grid-template-columns: 1fr; }
      .featured-card.card-large { grid-row: span 1; min-height: 320px; }
      .featured-card { min-height: 260px; }
    }
    .types-section { background: #f8f6f0; }
    .types-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem; margin-top: 2rem; }
    .type-card {
      background: #fff;
      border-radius: 10px;
      padding: 1.5rem 1rem;
      text-align: center;
      box-shadow: 0 2px 10px rgba(0,0,0,0.06);
      transition: transform 0.2s;
    }
    .type-card:hover { transform: translateY(-3px); }
    .type-icon { font-size: 2rem; display: block; margin-bottom: 0.5rem; }
    .type-card h3 { font-size: 0.9rem; color: #0a1628; margin: 0; font-weight: 600; }
  `],
})
export class HomeComponent implements OnInit, OnDestroy {
  featuredVoyages: Voyage[] = [];
  totalVoyages = 0;
  totalDestinations = 0;
  isAdmin = false;
  loadingFeatured = true;

  displayVoyages = 0;
  displayDestinations = 0;
  displaySatisfaction = 0;

  // Carousel
  currentSlide = 0;
  prevSlide = -1;
  private carouselTimer: any;

  slides = [
    { name: 'Santorini, Grèce',       img: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1600&q=80' },
    { name: 'Cappadoce, Turquie',      img: 'https://images.unsplash.com/photo-1641128324972-af3212f0f6bd?w=1600&q=80' },
    { name: 'Bali, Indonésie',         img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1600&q=80' },
    { name: 'Paris, France',           img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600&q=80' },
    { name: 'Marrakech, Maroc',        img: 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=1600&q=80' },
    { name: 'Djerba, Tunisie',         img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80' },
  ];

  types = [
    { icon: '🏖️', label: 'Balnéaire' },
    { icon: '🏔️', label: 'Montagne' },
    { icon: '🏛️', label: 'Culturel' },
    { icon: '🌿', label: 'Aventure' },
    { icon: '🏙️', label: 'City Trip' },
    { icon: '🚢', label: 'Croisière' },
  ];

  constructor(
    private voyageService: VoyageService,
    private destinationService: DestinationService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.startCarousel();
    this.countUp('displaySatisfaction', 100, 1200);

    this.voyageService.getAll({ limit: 3, sortBy: 'date_asc' }).subscribe({
      next: (res) => {
        this.zone.run(() => {
          this.featuredVoyages = res.data as Voyage[];
          this.totalVoyages = res.total || this.featuredVoyages.length;
          this.loadingFeatured = false;
          this.countUp('displayVoyages', this.totalVoyages, 1000);
          this.cdr.markForCheck();
        });
      },
    });

    this.destinationService.getAll().subscribe({
      next: (res) => {
        this.zone.run(() => {
          this.totalDestinations = res.count || (res.data as Destination[]).length;
          this.countUp('displayDestinations', this.totalDestinations, 1000);
          this.cdr.markForCheck();
        });
      },
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.carouselTimer);
  }

  private startCarousel(): void {
    this.carouselTimer = setInterval(() => {
      this.zone.run(() => { this.advance(); });
    }, 5000);
  }

  private advance(): void {
    this.prevSlide = this.currentSlide;
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    this.cdr.markForCheck();
  }

  goToSlide(i: number): void {
    this.prevSlide = this.currentSlide;
    this.currentSlide = i;
    clearInterval(this.carouselTimer);
    this.startCarousel();
    this.cdr.markForCheck();
  }

  prevSlideClick(): void {
    this.prevSlide = this.currentSlide;
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
    clearInterval(this.carouselTimer);
    this.startCarousel();
    this.cdr.markForCheck();
  }

  nextSlideClick(): void {
    clearInterval(this.carouselTimer);
    this.advance();
    this.startCarousel();
  }

  private countUp(prop: 'displayVoyages' | 'displayDestinations' | 'displaySatisfaction', target: number, duration: number): void {
    const steps = 40;
    const stepTime = duration / steps;
    let current = 0;
    const increment = target / steps;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        (this as any)[prop] = target;
        clearInterval(timer);
      } else {
        (this as any)[prop] = Math.round(current);
      }
      this.cdr.markForCheck();
    }, stepTime);
  }

  getDestination(voyage: Voyage): any {
    return typeof voyage.destination === 'object' ? voyage.destination : null;
  }

  getImageUrl(path: string): string {
    if (path.startsWith('http')) return path;
    return `http://localhost:4000${path}`;
  }
}
