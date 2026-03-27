import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { ContactService } from '../../services/contact.service';
import { Contact } from '../../interfaces/contact.interface';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule
  ],
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.css']
})
export class ContactsComponent implements OnInit {
  private contactService = inject(ContactService);
  private cd = inject(ChangeDetectorRef);

  searchQuery: string = '';
  activeFilters: Set<string> = new Set();
  allContacts: Contact[] = [];
  filteredContacts: Contact[] = [];
  displayedColumns: string[] = ['name', 'institution', 'phones', 'position'];

  ngOnInit(): void {
    this.loadContacts();
  }

  loadContacts(): void {
    this.contactService.getContacts().subscribe({
      next: (data) => {
        this.allContacts = data;
        this.applyFilters();
        this.cd.detectChanges();
      },
      error: (err) => console.error('Error loading contacts', err)
    });
  }

  applyFilters(): void {
    const text = this.searchQuery.trim().toLowerCase();

    // Si no hay búsqueda ni filtros activos, mostrar todos
    if (text === '' && this.activeFilters.size === 0) {
      this.filteredContacts = this.allContacts;
      return;
    }

    this.filteredContacts = this.allContacts.filter(contact => {
      // Filtrado por botones activos
      if (this.activeFilters.size > 0) {
        return Array.from(this.activeFilters).some(filter => {
          if (filter === 'name') return contact.contact_name?.toLowerCase().includes(text);
          if (filter === 'institution') return contact.contact_institution?.toLowerCase().includes(text);
          if (filter === 'position') return contact.contact_position?.toLowerCase().includes(text);
          return false;
        });
      }

      // Búsqueda global si no hay botones activos
      return (
        contact.contact_name?.toLowerCase().includes(text) ||
        contact.contact_institution?.toLowerCase().includes(text) ||
        contact.contact_position?.toLowerCase().includes(text) ||
        contact.phones.some(p => p.phone.includes(text))
      );
    });
  }

  toggleFilter(filter: string): void {
    this.activeFilters.has(filter) ? this.activeFilters.delete(filter) : this.activeFilters.add(filter);
    this.applyFilters();
  }

  isFilterActive(filter: string): boolean {
    return this.activeFilters.has(filter);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.applyFilters();
  }
}
