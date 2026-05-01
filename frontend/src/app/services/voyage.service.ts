import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, timeout, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Voyage, VoyageFilter } from '../models/voyage.model';

interface ApiResponse<T> {
  success: boolean;
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
  data: T;
  message?: string;
  errors?: string[];
}

@Injectable({
  providedIn: 'root',
})
export class VoyageService {
  private apiUrl = `${environment.apiUrl}/voyages`;

  constructor(private http: HttpClient) {
    console.log('[VoyageService] API URL:', this.apiUrl);
  }

  private withTimeout<T>(obs: Observable<T>): Observable<T> {
    return obs.pipe(
      timeout(8000),
      catchError(err => {
        console.error('[VoyageService] Request failed:', err.name, err.message, '→ URL:', this.apiUrl);
        return throwError(() => err);
      })
    );
  }

  getAll(filters?: VoyageFilter): Observable<ApiResponse<Voyage[]>> {
    let params = new HttpParams();
    if (filters) {
      Object.entries(filters).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          params = params.set(key, String(val));
        }
      });
    }
    return this.withTimeout(this.http.get<ApiResponse<Voyage[]>>(this.apiUrl, { params }));
  }

  getById(id: string): Observable<ApiResponse<Voyage>> {
    return this.withTimeout(this.http.get<ApiResponse<Voyage>>(`${this.apiUrl}/${id}`));
  }

  create(formData: FormData): Observable<ApiResponse<Voyage>> {
    return this.withTimeout(this.http.post<ApiResponse<Voyage>>(this.apiUrl, formData));
  }

  update(id: string, formData: FormData): Observable<ApiResponse<Voyage>> {
    return this.withTimeout(this.http.put<ApiResponse<Voyage>>(`${this.apiUrl}/${id}`, formData));
  }

  delete(id: string): Observable<ApiResponse<null>> {
    return this.withTimeout(this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`));
  }
}
