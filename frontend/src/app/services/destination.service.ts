import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, timeout, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Destination } from '../models/destination.model';

interface ApiResponse<T> {
  success: boolean;
  count?: number;
  data: T;
  message?: string;
  errors?: string[];
}

@Injectable({
  providedIn: 'root',
})
export class DestinationService {
  private apiUrl = `${environment.apiUrl}/destinations`;

  constructor(private http: HttpClient) {
    console.log('[DestinationService] API URL:', this.apiUrl);
  }

  private withTimeout<T>(obs: Observable<T>): Observable<T> {
    return obs.pipe(
      timeout(60000),
      catchError(err => {
        console.error('[DestinationService] Request failed:', err.name, err.message, '→ URL:', this.apiUrl);
        return throwError(() => err);
      })
    );
  }

  getAll(search?: string): Observable<ApiResponse<Destination[]>> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    return this.withTimeout(this.http.get<ApiResponse<Destination[]>>(this.apiUrl, { params }));
  }

  getById(id: string): Observable<ApiResponse<Destination>> {
    return this.withTimeout(this.http.get<ApiResponse<Destination>>(`${this.apiUrl}/${id}`));
  }

  create(formData: FormData): Observable<ApiResponse<Destination>> {
    return this.withTimeout(this.http.post<ApiResponse<Destination>>(this.apiUrl, formData));
  }

  update(id: string, formData: FormData): Observable<ApiResponse<Destination>> {
    return this.withTimeout(this.http.put<ApiResponse<Destination>>(`${this.apiUrl}/${id}`, formData));
  }

  delete(id: string): Observable<ApiResponse<null>> {
    return this.withTimeout(this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`));
  }
}
