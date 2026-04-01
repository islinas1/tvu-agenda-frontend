import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { ContactService } from '../../../services/contact.service';
import { Contact } from '../../../interfaces/contact.interface';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-contacts',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatIconModule, MatTableModule, MatChipsModule
  ],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ContactsComponent implements OnInit {
  constructor(private router: Router, private authService: AuthService) { }

  private contactService = inject(ContactService);
  private cd = inject(ChangeDetectorRef);

  searchQuery: string = '';
  activeFilters: Set<string> = new Set();
  allContacts: Contact[] = [];
  filteredContacts: Contact[] = [];
  // Sin 'actions' por defecto, se agrega en ngOnInit si es admin
  displayedColumns: string[] = ['name', 'phones', 'position', 'institution'];

  // Para edicion inline
  editingId: number | null = null;
  editData = { contact_name: '', contact_institution: '', contact_position: '', description: '' };

  // Para confirmacion de eliminar
  confirmDeleteId: number | null = null;

  ngOnInit(): void {
    if (this.isAdmin()) {
      this.displayedColumns = ['name', 'phones', 'position', 'institution', 'actions'];
    }
    this.loadContacts();
  }

  loadContacts(): void {
    this.contactService.getContacts().subscribe({
      next: (data) => {
        this.allContacts = data;
        this.filteredContacts = data.slice();
        this.cd.markForCheck();
      },
      error: (err) => console.error('Error loading contacts', err)
    });
  }

  applyFilters(): void {
    const text = this.searchQuery.trim().toLowerCase();
    if (text === '' && this.activeFilters.size === 0) {
      this.filteredContacts = this.allContacts.slice();
      this.cd.markForCheck();
      return;
    }
    this.filteredContacts = this.allContacts.filter(contact => {
      if (this.activeFilters.size > 0) {
        return Array.from(this.activeFilters).some(filterType => {
          let value: string | null | undefined;
          if (filterType === 'name') value = contact.contact_name;
          else if (filterType === 'institution') value = contact.contact_institution;
          else if (filterType === 'position') value = contact.contact_position;
          else return false;
          return value?.toString().toLowerCase().includes(text) ?? false;
        });
      }
      return (
        (contact.contact_name?.toLowerCase().includes(text) ?? false) ||
        (contact.contact_institution?.toLowerCase().includes(text) ?? false) ||
        (contact.contact_position?.toLowerCase().includes(text) ?? false) ||
        (contact.phones?.some(p => p?.phone?.includes(text)) ?? false)
      );
    });
    this.cd.markForCheck();
  }

  newContact(): void { this.router.navigate(['/register']); }
  toggleFilter(filter: string): void {
    this.activeFilters.has(filter) ? this.activeFilters.delete(filter) : this.activeFilters.add(filter);
    this.applyFilters();
  }
  isFilterActive(filter: string): boolean { return this.activeFilters.has(filter); }
  clearSearch(): void { this.searchQuery = ''; this.applyFilters(); }
  isAdmin(): boolean { return this.authService.isAdmin(); }

  // ======== EDITAR ========
  editContact(contact: Contact): void {
    this.editingId = contact.id_contact;
    this.editData = {
      contact_name: contact.contact_name,
      contact_institution: contact.contact_institution || '',
      contact_position: contact.contact_position || '',
      description: contact.description || ''
    };
  }

  cancelEdit(): void {
    this.editingId = null;
  }

  saveEdit(): void {
    if (!this.editingId || !this.editData.contact_name.trim()) return;
    this.contactService.updateContact(this.editingId, {
      ...this.editData,
      is_active: true
    }).subscribe({
      next: () => {
        this.editingId = null;
        this.loadContacts();
      },
      error: (err) => alert(err.error?.error || 'Error al actualizar')
    });
  }

  // ======== ELIMINAR (desactivar) ========
  deleteContact(contact: Contact): void {
    this.confirmDeleteId = contact.id_contact;
  }

  cancelDelete(): void {
    this.confirmDeleteId = null;
  }

  confirmDelete(id: number): void {
    this.contactService.deactivateContact(id).subscribe({
      next: () => {
        this.confirmDeleteId = null;
        this.loadContacts();
      },
      error: (err) => alert(err.error?.error || 'Error al eliminar')
    });
  }
}