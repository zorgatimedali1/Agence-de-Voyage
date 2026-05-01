import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DestinationService } from '../../services/destination.service';

@Component({
  selector: 'app-destination-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <div class="container">
          <h1 class="page-title">{{ isEdit ? 'Modifier la Destination' : 'Nouvelle Destination' }}</h1>
          <a routerLink="/destinations" class="btn-back">← Retour</a>
        </div>
      </div>

      <div class="container">
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-card">

          <!-- Informations principales -->
          <div class="form-section">
            <h2 class="form-section-title">Informations générales</h2>
            <div class="form-grid">
              <div class="form-group">
                <label>Nom de la destination *</label>
                <input formControlName="nom" type="text" placeholder="Ex: Santorini" class="form-input"
                  [class.invalid]="isInvalid('nom')" />
                <span class="error-msg" *ngIf="isInvalid('nom')">Le nom est obligatoire</span>
              </div>

              <div class="form-group">
                <label>Pays *</label>
                <input formControlName="pays" type="text" placeholder="Ex: Grèce" class="form-input"
                  [class.invalid]="isInvalid('pays')" />
                <span class="error-msg" *ngIf="isInvalid('pays')">Le pays est obligatoire</span>
              </div>

              <div class="form-group span-2">
                <label>Description</label>
                <textarea formControlName="description" placeholder="Décrivez cette destination..." class="form-textarea" rows="4"></textarea>
              </div>

              <div class="form-group">
                <label>Climat</label>
                <select formControlName="climat" class="form-select">
                  <option value="tropical">Tropical</option>
                  <option value="désertique">Désertique</option>
                  <option value="méditerranéen">Méditerranéen</option>
                  <option value="continental">Continental</option>
                  <option value="polaire">Polaire</option>
                  <option value="tempéré">Tempéré</option>
                </select>
              </div>

              <div class="form-group">
                <label>Langue locale</label>
                <input formControlName="langueLocale" type="text" placeholder="Ex: Grec" class="form-input" />
              </div>

              <div class="form-group">
                <label>Monnaie locale</label>
                <input formControlName="monnaie" type="text" placeholder="Ex: Euro (€)" class="form-input" />
              </div>
            </div>
          </div>

          <!-- Image -->
          <div class="form-section">
            <h2 class="form-section-title">Image de la destination</h2>
            <div class="form-group">
              <label>Photo</label>
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
              {{ loading ? 'Enregistrement...' : (isEdit ? 'Mettre à jour' : 'Créer la destination') }}
            </button>
            <a routerLink="/destinations" class="btn-cancel">Annuler</a>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page { background: #f8f6f0; min-height: 100vh; }
    .page-header { background: #0a1628; padding: 2rem 0; margin-bottom: 2rem; }
    .container { max-width: 800px; margin: 0 auto; padding: 0 1.5rem; }
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
      border-radius: 6px; font-size: 0.9rem;
      background: #fafaf8; color: #333;
      outline: none; transition: border-color 0.2s; font-family: inherit;
    }
    .form-input:focus, .form-select:focus, .form-textarea:focus { border-color: #c8a96e; background: #fff; }
    .form-input.invalid { border-color: #e74c3c; }
    .form-textarea { resize: vertical; }
    .error-msg { font-size: 0.78rem; color: #e74c3c; }
    .form-file { padding: 0.5rem 0; }
    .file-hint { font-size: 0.75rem; color: #aaa; margin: 0.25rem 0 0; }
    .image-preview { margin-top: 0.75rem; }
    .image-preview img { max-width: 280px; max-height: 180px; border-radius: 8px; object-fit: cover; border: 1px solid #e0d8cc; }
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
export class DestinationFormComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  destId = '';
  loading = false;
  errorMsg = '';
  imagePreview: string | null = null;
  imageFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private destinationService: DestinationService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.destId = this.route.snapshot.paramMap.get('id') || '';
    if (this.destId) {
      this.isEdit = true;
      this.loadDestination();
    }
  }

  buildForm(): void {
    this.form = this.fb.group({
      nom: ['', [Validators.required, Validators.maxLength(100)]],
      pays: ['', Validators.required],
      description: [''],
      climat: ['méditerranéen'],
      langueLocale: [''],
      monnaie: [''],
    });
  }

  loadDestination(): void {
    this.destinationService.getById(this.destId).subscribe({
      next: (res) => {
        this.form.patchValue(res.data as any);
        if ((res.data as any).image) {
          this.imagePreview = `http://localhost:4000${(res.data as any).image}`;
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
      if (value !== null && value !== undefined && value !== '') {
        formData.append(key, String(value));
      }
    });

    if (this.imageFile) {
      formData.append('image', this.imageFile);
    }

    const request$ = this.isEdit
      ? this.destinationService.update(this.destId, formData)
      : this.destinationService.create(formData);

    request$.subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/destinations']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error?.message || err.error?.errors?.join(', ') || 'Une erreur est survenue';
      },
    });
  }
}
