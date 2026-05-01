import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private _isAdmin = new BehaviorSubject<boolean>(this.hasToken());

  isAdmin$ = this._isAdmin.asObservable();

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { username, password }).pipe(
      tap((res: any) => {
        if (res.success) {
          localStorage.setItem('admin_token', res.token);
          localStorage.setItem('admin_user', JSON.stringify(res.admin));
          this._isAdmin.next(true);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    this._isAdmin.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem('admin_token');
  }

  isAdmin(): boolean {
    return this.hasToken();
  }

  getAdminUser(): any {
    const u = localStorage.getItem('admin_user');
    return u ? JSON.parse(u) : null;
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('admin_token');
  }
}
