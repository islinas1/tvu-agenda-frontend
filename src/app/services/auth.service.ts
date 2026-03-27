import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface LoginResponse {
  message: string;
  role: 'admin' | 'usuario';
  redirect: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';

  constructor(private http: HttpClient) { }

  login(ci: string, password?: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { ci, password });
  }
  checkCI(ci: string): Observable<{ role: 'admin' | 'usuario', redirect: string }> {
    return this.http.post<{ role: 'admin' | 'usuario', redirect: string }>(
      `${this.apiUrl}/check-ci`, { ci }
    );
  }
  
}