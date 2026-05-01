import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { VoyageService } from '../../services/voyage.service';
import { DestinationService } from '../../services/destination.service';
import { Destination } from '../../models/destination.model';

@Component({
  selector: 'app-voyage-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <div class="container">
          <h1 class="page-title">{{ isEdit ? 'Modifier le Voyage' : 'Nouveau Voyage' }}</h1>
          <a routerLink="/voyages" class="btn-back">← Retour</a>
        </div>
      </div>

      <div class="container">
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-card">

          <!-- Informations principales -->
          <div class="form-section">
            <h2 class="form-section-title">Informations principales</h2>
            <div class="form-grid">
              <div class="form-group span-2">
                <label>Titre du voyage *</label>
                <input formControlName="titre" type="text" placeholder="Ex: Escapade en Toscane" class="form-input"
                  [class.invalid]="isInvalid('titre')" />
                <span class="error-msg" *ngIf="isInvalid('titre')">Le titre est obligatoire</span>
              </div>

              <div class="form-group">
                <label>Destination *</label>
                <select formControlName="destination" class="form-select" [class.invalid]="isInvalid('destination')">
                  <option value="">Choisir une destination</option>
                  <option *ngFor="let dest of destinations" [value]="dest._id">{{ dest.nom }}, {{ dest.pays }}</option>
                </select>
                <span class="error-msg" *ngIf="isInvalid('destination')">La destination est obligatoire</span>
              </div>

              <div class="form-group">
                <label>Type de voyage *</label>
                <select formControlName="typeVoyage" class="form-select">
                  <option value="aventure">Aventure</option>
                  <option value="culturel">Culturel</option>
                  <option value="balnéaire">Balnéaire</option>
                  <option value="montagne">Montagne</option>
                  <option value="citytrip">City Trip</option>
                  <option value="croisière">Croisière</option>
                </select>
              </div>

              <div class="form-group span-2">
                <label>Description</label>
                <textarea formControlName="description" placeholder="Décrivez ce voyage..." class="form-textarea" rows="4"></textarea>
              </div>
            </div>
          </div>

          <!-- Dates et places -->
          <div class="form-section">
            <h2 class="form-section-title">Dates & Disponibilité</h2>
            <div class="form-grid">
              <div class="form-group">
                <label>Date de départ *</label>
                <input formControlName="dateDepart" type="date" class="form-input" [class.invalid]="isInvalid('dateDepart')" />
                <span class="error-msg" *ngIf="isInvalid('dateDepart')">La date de départ est obligatoire</span>
              </div>

              <div class="form-group">
                <label>Date de retour *</label>
                <input formControlName="dateRetour" type="date" class="form-input" [class.invalid]="isInvalid('dateRetour')" />
                <span class="error-msg" *ngIf="isInvalid('dateRetour')">La date de retour est obligatoire</span>
              </div>

              <div class="form-group">
                <label>Durée (jours) *</label>
                <input formControlName="duree" type="number" min="1" class="form-input" [class.invalid]="isInvalid('duree')" />
                <span class="error-msg" *ngIf="isInvalid('duree')">Durée invalide</span>
              </div>

              <div class="form-group">
                <label>Places disponibles *</label>
                <input formControlName="placesDisponibles" type="number" min="0" class="form-input" [class.invalid]="isInvalid('placesDisponibles')" />
                <span class="error-msg" *ngIf="isInvalid('placesDisponibles')">Nombre de places invalide</span>
              </div>
            </div>
          </div>

          <!-- Prix -->
          <div class="form-section">
            <h2 class="form-section-title">Tarification</h2>
            <div class="form-grid">
              <div class="form-group">
                <label>Prix (TND) *</label>
                <input formControlName="prix" type="number" min="0" step="0.01" placeholder="0.00" class="form-input" [class.invalid]="isInvalid('prix')" />
                <span class="error-msg" *ngIf="isInvalid('prix')">Le prix est obligatoire</span>
              </div>
            </div>
          </div>

          <!-- Ce qui est inclus -->
          <div class="form-section">
            <h2 class="form-section-title">Ce qui est inclus</h2>
            <div class="inclus-list" formArrayName="inclus">
              <div *ngFor="let ctrl of inclusArray.controls; let i = index" class="inclus-item">
                <input [formControlName]="i" type="text" placeholder="Ex: Hébergement petit-déjeuner" class="form-input" />
                <button type="button" (click)="removeInclus(i)" class="btn-remove">✕</button>
              </div>
            </div>
            <button type="button" (click)="addInclus()" class="btn-add-item">+ Ajouter un élément</button>
          </div>

          <!-- Image -->
          <div class="form-section">
            <h2 class="form-section-title">Image</h2>
            <div class="form-group">
              <label>Photo du voyage</label>
              <input type="file" accept="image/*" (change)="onFileChange($event)" class="form-file" />
              <p class="file-hint">JPEG, PNG ou WebP · 5MB max</p>
              <div class="image-preview" *ngIf="imagePreview">
                <img [src]="imagePreview" alt="Aperçu" />
              </div>
            </div>
          </div>

          <!-- Erreur globale -->
          <div class="form-error" *ngIf="errorMsg">{{ errorMsg }}</div>

          <!-- Actions -->
          <div class="form-actions">
            <button type="submit" [disabled]="loading" class="btn-submit">
              {{ loading ? 'Enregistrement...' : (isEdit ? 'Mettre à jour' : 'Créer le voyage') }}
            </button>
            <a routerLink="/voyages" class="btn-cancel">Annuler</a>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page { background: #f8f6f0; min-height: 100vh; }
    .page-header { background: #0a1628; padding: 2rem 0; margin-bottom: 2rem; }
    .container { max-width: 860px; margin: 0 auto; padding: 0 1.5rem; }
    .page-header .container { display: flex; justify-content: space-between; align-items: center; max-width: 1200px; }
    .page-title { color: #fff; font-size: 1.8rem; font-family: 'Georgia', serif; margin: 0; }
    .btn-back { color: #c8a96e; text-decoration: none; font-size: 0.9rem; font-weight: 600; }
    .form-card { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); margin-bottom: 2rem; }
    .form-section { padding: 2rem; border-bottom: 1px solid #f0ece5; }
    .form-section:last-child { border-bottom: none; }
    .form-section-title { font-size: 1rem; font-family: 'Georgia', serif; color: #0a1628; margin: 0 0 1.5rem; padding-bottom: 0.75rem; border-bottom: 2px solid #c8a96e; display: inline-block; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.4rem; }
    .span-2 { grid-column: span 2; }
    label { font-size: 0.85rem; font-weight: 600; color: #444; }
    .form-input, .form-select, .form-textarea {
      padding: 0.7rem 0.9rem;
      border: 1px solid #e0d8cc;
      border-radius: 6px;
      font-size: 0.9rem;
      background: #fafaf8;
      color: #333;
      outline: none;
      transition: border-color 0.2s;
      font-family: inherit;
    }
    .form-input:focus, .form-select:focus, .form-textarea:focus { border-color: #c8a96e; background: #fff; }
    .form-input.invalid, .form-select.invalid { border-color: #e74c3c; }
    .form-textarea { resize: vertical; }
    .error-msg { font-size: 0.78rem; color: #e74c3c; }
    .inclus-list { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 0.75rem; }
    .inclus-item { display: flex; gap: 0.5rem; }
    .inclus-item .form-input { flex: 1; }
    .btn-remove {
      background: #fff0f0; color: #e74c3c; border: none;
      border-radius: 6px; width: 36px; cursor: pointer;
      font-size: 0.9rem; transition: background 0.2s;
    }
    .btn-remove:hover { background: #fde8e8; }
    .btn-add-item {
      background: none; border: 1px dashed #c8a96e;
      color: #c8a96e; padding: 0.5rem 1rem;
      border-radius: 6px; cursor: pointer; font-size: 0.85rem;
      transition: all 0.2s;
    }
    .btn-add-item:hover { background: rgba(200,169,110,0.08); }
    .form-file { padding: 0.5rem 0; }
    .file-hint { font-size: 0.75rem; color: #aaa; margin: 0.25rem 0 0; }
    .image-preview { margin-top: 0.75rem; }
    .image-preview img { max-width: 250px; max-height: 160px; border-radius: 8px; object-fit: cover; border: 1px solid #e0d8cc; }
    .form-error { margin: 0 2rem; padding: 0.85rem 1rem; background: #fde8e8; color: #c0392b; border-radius: 6px; font-size: 0.9rem; }
    .form-actions { padding: 2rem; display: flex; gap: 1rem; }
    .btn-submit {
      background: #c8a96e; color: #0a1628;
      padding: 0.8rem 2rem; border-radius: 6px;
      border: none; cursor: pointer; font-weight: 700; font-size: 0.95rem;
      transition: all 0.2s; font-family: 'Georgia', serif;
    }
    .btn-submit:hover:not(:disabled) { background: #d4b87e; }
    .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-cancel {
      background: #f5f3ee; color: #555;
      padding: 0.8rem 1.5rem; border-radius: 6px;
      text-decoration: none; font-weight: 600; font-size: 0.9rem;
    }
    @media (max-width: 640px) {
      .form-grid { grid-template-columns: 1fr; }
      .span-2 { grid-column: span 1; }
    }
  `],
})
export class VoyageFormComponent implements OnInit {
  form!: FormGroup;
  destinations: Destination[] = [];
  isEdit = false;
  voyageId = '';
  loading = false;
  errorMsg = '';
  imagePreview: string | null = null;
  imageFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private voyageService: VoyageService,
    private destinationService: DestinationService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadDestinations();

    this.voyageId = this.route.snapshot.paramMap.get('id') || '';
    if (this.voyageId) {
      this.isEdit = true;
      this.loadVoyage();
    }
  }

  buildForm(): void {
    this.form = this.fb.group({
      titre: ['', [Validators.required, Validators.maxLength(150)]],
      destination: ['', Validators.required],
      description: [''],
      prix: [null, [Validators.required, Validators.min(0)]],
      duree: [null, [Validators.required, Validators.min(1)]],
      dateDepart: ['', Validators.required],
      dateRetour: ['', Validators.required],
      placesDisponibles: [null, [Validators.required, Validators.min(0)]],
      typeVoyage: ['culturel'],
      inclus: this.fb.array([]),
    });
  }

  get inclusArray(): FormArray {
    return this.form.get('inclus') as FormArray;
  }

  addInclus(): void {
    this.inclusArray.push(this.fb.control(''));
  }

  removeInclus(i: number): void {
    this.inclusArray.removeAt(i);
  }

  loadDestinations(): void {
    this.destinationService.getAll().subscribe({
      next: (res) => (this.destinations = res.data as Destination[]),
    });
  }

  loadVoyage(): void {
    this.voyageService.getById(this.voyageId).subscribe({
      next: (res) => {
        const v = res.data as any;
        this.form.patchValue({
          titre: v.titre,
          destination: typeof v.destination === 'object' ? v.destination._id : v.destination,
          description: v.description,
          prix: v.prix,
          duree: v.duree,
          dateDepart: this.formatDate(v.dateDepart),
          dateRetour: this.formatDate(v.dateRetour),
          placesDisponibles: v.placesDisponibles,
          typeVoyage: v.typeVoyage,
        });
        if (v.inclus) {
          v.inclus.forEach((item: string) => this.inclusArray.push(this.fb.control(item)));
        }
        if (v.image) {
          this.imagePreview = `http://localhost:4000${v.image}`;
        }
      },
    });
  }

  onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowed.includes(file.type)) {
        this.errorMsg = 'Format invalide. Utilisez JPEG, PNG ou WebP uniquement.';
        (event.target as HTMLInputElement).value = '';
        this.imageFile = null;
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.errorMsg = "L'image ne peut pas dépasser 5MB.";
        (event.target as HTMLInputElement).value = '';
        this.imageFile = null;
        return;
      }
      this.errorMsg = '';
      this.imageFile = file;
      const reader = new FileReader();
      reader.onload = () => (this.imagePreview = reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    const formData = new FormData();
    const val = this.form.value;

    Object.entries(val).forEach(([key, value]) => {
      if (key === 'inclus') {
        (value as string[]).forEach((item) => {
          if (item.trim()) formData.append('inclus[]', item.trim());
        });
      } else if (value !== null && value !== undefined && value !== '') {
        formData.append(key, String(value));
      }
    });

    if (this.imageFile) {
      formData.append('image', this.imageFile);
    }

    const request$ = this.isEdit
      ? this.voyageService.update(this.voyageId, formData)
      : this.voyageService.create(formData);

    request$.subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/voyages']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error?.message || err.error?.errors?.join(', ') || 'Une erreur est survenue';
      },
    });
  }

  private formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toISOString().split('T')[0];
  }
}
