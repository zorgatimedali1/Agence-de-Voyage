import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, timeout, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Order } from '../models/order.model';
import { AuthService } from './auth.service';

interface ApiResponse<T> {
  success: boolean;
  total?: number;
  page?: number;
  pages?: number;
  data: T;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private authHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
  }

  private withTimeout<T>(obs: Observable<T>): Observable<T> {
    return obs.pipe(
      timeout(10000),
      catchError(err => throwError(() => err))
    );
  }

  create(order: Partial<Order>): Observable<ApiResponse<Order>> {
    return this.withTimeout(this.http.post<ApiResponse<Order>>(this.apiUrl, order));
  }

  getAll(statut?: string, page = 1): Observable<ApiResponse<Order[]>> {
    let params = new HttpParams().set('page', String(page)).set('limit', '20');
    if (statut) params = params.set('statut', statut);
    return this.withTimeout(this.http.get<ApiResponse<Order[]>>(this.apiUrl, { headers: this.authHeaders(), params }));
  }

  updateStatut(id: string, statut: string): Observable<ApiResponse<Order>> {
    return this.withTimeout(this.http.patch<ApiResponse<Order>>(`${this.apiUrl}/${id}/statut`, { statut }, { headers: this.authHeaders() }));
  }

  delete(id: string): Observable<ApiResponse<null>> {
    return this.withTimeout(this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`, { headers: this.authHeaders() }));
  }
}
