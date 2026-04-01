import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Contact } from '../interfaces/contact.interface';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl + '/contacts';

  getContacts(search: string = ''): Observable<Contact[]> {
    let params = new HttpParams();
    if (search.trim()) {
      params = params.set('search', search);
    }
    return this.http.get<Contact[]>(this.API_URL, { params });
  }

  createContact(contact: any): Observable<Contact> {
    return this.http.post<Contact>(this.API_URL, contact);
  }

  updateContact(id: number, contact: any): Observable<Contact> {
    return this.http.put<Contact>(`${this.API_URL}/${id}`, contact);
  }

  deactivateContact(id: number): Observable<any> {
    return this.http.patch(`${this.API_URL}/deactivate/${id}`, {});
  }

  deleteContact(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }
}