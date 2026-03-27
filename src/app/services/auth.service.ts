import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } fromfrom '../../environments/environment';

interface LoginResponse {
  message: string;
  role: 'admin' | 'usuario';
  redirect: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
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