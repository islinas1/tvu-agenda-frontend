import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:3000/api/users';

  getUsers(search: string = ''): Observable<User[]> {
    let params = new HttpParams();
    if (search.trim()) {
      params = params.set('search', search);
    }
    return this.http.get<User[]>(this.API_URL, { params });
  }

  createUser(user: Partial<User>): Observable<User> {
    return this.http.post<User>(this.API_URL, user);
  }
}