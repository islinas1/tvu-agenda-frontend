import { Component, OnInit, inject,  ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { ContactService } from '../../services/contact.service';
import { AuthService } from '../../services/auth.service';
import { Contact } from '../../interfaces/contact.interface';

@Component({
  selector: 'app-contacts',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  private authService = inject(AuthService);

  searchQuery: string = '';
  activeFilters: Set<string> = new Set();
  allContacts: Contact[] = [];
  filteredContacts: any = [];
  displayedColumns: string[] = ['name', 'institution', 'phones', 'position'];

  // Formulario
  showForm: boolean = false;
  editingContact: Contact | null = null;
  formData = {
    contact_name: '',
    contact_institution: '',
    contact_position: '',
    description: '',
    phones: ['']  // Array de telefonos
  };
  formError: string = '';
  formSuccess: string = '';


  confirmDeleteId: number | null = null;

  isAdmin: boolean = false;

  ngOnInit(): void {
    this.isAdmin = this.authService.getUserRole() === 'admin';
    if (this.isAdmin) {
      this.displayedColumns = ['name', 'institution', 'phones', 'position', 'actions'];
    }
    this.loadContacts();
  }

  private cd = inject(ChangeDetectorRef);

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
        return Array.from(this.activeFilters).some(filter => {
          if (filter === 'name') return contact.contact_name?.toLowerCase().includes(text);
          if (filter === 'institution') return contact.contact_institution?.toLowerCase().includes(text);
          if (filter === 'position') return contact.contact_position?.toLowerCase().includes(text);
          return false;
        });
      }
      return (
        contact.contact_name?.toLowerCase().includes(text) ||
        contact.contact_institution?.toLowerCase().includes(text) ||
        contact.contact_position?.toLowerCase().includes(text) ||
        contact.phones?.some(p => p.phone?.includes(text))
      );
    });
    this.cd.markForCheck();
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

  // ======== TELEFONOS EN FORMULARIO ========
  agregarTelefono(): void {
    this.formData.phones.push('');
  }

  quitarTelefono(index: number): void {
    if (this.formData.phones.length > 1) {
      this.formData.phones.splice(index, 1);
    }
  }

  trackByIndex(index: number): number {
    return index;
  }

  // ======== CRUD ========
  abrirFormulario(): void {
    this.editingContact = null;
    this.formData = {
      contact_name: '',
      contact_institution: '',
      contact_position: '',
      description: '',
      phones: ['']
    };
    this.formError = '';
    this.formSuccess = '';
    this.showForm = true;
  }

  editarContacto(contact: Contact): void {
    this.editingContact = contact;
    const telefonos = contact.phones
      ?.filter(p => p.phone)
      .map(p => p.phone) || [''];
    this.formData = {
      contact_name: contact.contact_name,
      contact_institution: contact.contact_institution || '',
      contact_position: contact.contact_position || '',
      description: contact.description || '',
      phones: telefonos.length > 0 ? telefonos : ['']
    };
    this.formError = '';
    this.formSuccess = '';
    this.showForm = true;
  }

  cancelarFormulario(): void {
    this.showForm = false;
    this.editingContact = null;
    this.formError = '';
    this.formSuccess = '';
  }

  guardarContacto(): void {
    if (!this.formData.contact_name.trim()) {
      this.formError = 'El nombre es obligatorio';
      return;
    }
    this.formError = '';

    const payload: any = {
      contact_name: this.formData.contact_name,
      contact_institution: this.formData.contact_institution,
      contact_position: this.formData.contact_position,
      description: this.formData.description,
      created_by: 1,
      phones: this.formData.phones.filter(p => p.trim() !== '')
    };

    if (this.editingContact) {
      payload.is_active = this.editingContact.is_active;
      this.contactService.updateContact(this.editingContact.id_contact, payload).subscribe({
        next: () => {
          this.formSuccess = 'Contacto actualizado';
          this.loadContacts();
          setTimeout(() => this.cancelarFormulario(), 1000);
        },
        error: (err) => this.formError = err.error?.error || 'Error al actualizar'
      });
    } else {
      this.contactService.createContact(payload).subscribe({
        next: () => {
          this.formSuccess = 'Contacto creado';
          this.loadContacts();
          setTimeout(() => this.cancelarFormulario(), 1000);
        },
        error: (err) => this.formError = err.error?.error || 'Error al crear'
      });
    }
  }

  pedirConfirmacion(id: number): void {
    this.confirmDeleteId = id;
  }

  cancelarEliminar(): void {
    this.confirmDeleteId = null;
  }

  eliminarContacto(id: number): void {
    this.contactService.deactivateContact(id).subscribe({
      next: () => {
        this.confirmDeleteId = null;
        this.loadContacts();
      },
      error: (err) => console.error('Error al eliminar', err)
    });
  }
}