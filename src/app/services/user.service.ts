import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../interfaces/user.interface';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  getUsers(search: string = ''): Observable<User[]> {
    let params = new HttpParams();
    if (search.trim()) {
      params = params.set('search', search);
    }
    return this.http.get<User[]>(`${this.API_URL}/users`, { params });
  }

  createUser(user: Partial<User>): Observable<User> {
    return this.http.post<User>(`${this.API_URL}/users`, user);
  }

  updateUser(id: number, user: any): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/users/${id}`, user);
  }

  deactivateUser(id: number): Observable<any> {
    return this.http.patch(`${this.API_URL}/users/deactivate/${id}`, {});
  }
}