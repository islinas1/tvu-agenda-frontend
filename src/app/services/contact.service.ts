import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Contact } from '../interfaces/contact.interface';

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:3000/api/contacts';

  getContacts(search: string = ''): Observable<Contact[]> {
    let params = new HttpParams();
    if (search.trim()) {
      params = params.set('search', search);
    }
    return this.http.get<Contact[]>(this.API_URL, { params });
  }

  createContact(contact: Partial<Contact>): Observable<Contact> {
    return this.http.post<Contact>(this.API_URL, contact);
  }
}