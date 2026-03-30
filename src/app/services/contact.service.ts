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
  private readonly API_URL = environment.apiUrl;

  getContacts(search: string = ''): Observable<Contact[]> {
    let params = new HttpParams();
    if (search.trim()) {
      params = params.set('search', search);
    }
    return this.http.get<Contact[]>(`${this.API_URL}/contacts`, { params });
  }

  createContact(contact: Partial<Contact>): Observable<Contact> {
    return this.http.post<Contact>(`${this.API_URL}/contacts`, contact);
  }
}