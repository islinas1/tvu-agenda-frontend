import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environments';

interface LoginResponse {
  message: string;
  role: 'admin' | 'usuario';
  redirect: string;
  token: string;
}

interface CheckCIResponse {
  role: 'admin' | 'usuario';
  redirect: string;
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  
  constructor(private http: HttpClient) { }

  checkCI(ci: string): Observable<CheckCIResponse> {
    return this.http.post<CheckCIResponse>(
      `${this.apiUrl}/auth/check-ci`, { ci }
    ).pipe(
      tap(res => {
        if (res.token) {
          localStorage.setItem('token', res.token);
        }
      })
    );
  }

  login(ci: string, password?: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/auth/login`, { ci, password }
    ).pipe(
      tap(res => {
        if (res.token) {
          localStorage.setItem('token', res.token);
        }
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split('.')[1])).role;
    } catch {
      return null;
    }
  }

  logout(): void {
    localStorage.removeItem('token');
  }
}