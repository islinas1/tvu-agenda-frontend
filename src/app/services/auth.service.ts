import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  login(ci: string, password?: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, { ci, password })
      .pipe(
        tap(res => {
          if (res.token) {
            localStorage.setItem('token', res.token);
            const payload = JSON.parse(atob(res.token.split('.')[1]));
            localStorage.setItem('user', JSON.stringify(payload));
          }
        })
      );
  }

  checkCI(ci: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/check-ci`, { ci }).pipe(
      tap(res => {
        if (res.token) {
          localStorage.setItem('token', res.token);
          const payload = JSON.parse(atob(res.token.split('.')[1]));
          localStorage.setItem('user', JSON.stringify(payload));
        }
      })
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/users/change-password`, { currentPassword, newPassword });
  }

  getUser() {
    const raw = localStorage.getItem('user');
    if (!raw || raw === 'undefined' || raw === 'null') return {};
    try { return JSON.parse(raw); } catch { return {}; }
  }

  getUserName(): string {
    const user = this.getUser();
    return user.name || 'Usuario';
  }

  getRole(): number {
    const user = this.getUser();
    if (user.role_id) return user.role_id;
    if (user.role === 'admin') return 1;
    if (user.role === 'usuario') return 2;
    return 0;
  }

  isAdmin(): boolean { return this.getRole() === 1; }
  isLoggedIn(): boolean { return !!localStorage.getItem('token'); }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}