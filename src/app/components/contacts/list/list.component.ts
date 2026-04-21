import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
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
    MatInputModule, MatIconModule, MatTableModule, MatChipsModule,
    MatPaginatorModule
  ],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ContactsComponent implements OnInit, AfterViewInit {
  constructor(private router: Router, private authService: AuthService) { }

  private contactService = inject(ContactService);
  private cd = inject(ChangeDetectorRef);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  searchQuery: string = '';
  activeFilters: Set<string> = new Set();
  allContacts: Contact[] = [];
  dataSource = new MatTableDataSource<Contact>([]);
  displayedColumns: string[] = ['name', 'phones', 'position', 'institution'];

  editingId: number | null = null;
  editData = { contact_name: '', contact_institution: '', contact_position: '', description: '' };
  confirmDeleteId: number | null = null;

  ngOnInit(): void {
    if (this.isAdmin()) {
      this.displayedColumns = ['name', 'phones', 'position', 'institution', 'actions'];
    }
    this.loadContacts();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  loadContacts(): void {
    this.contactService.getContacts().subscribe({
      next: (data) => {
        this.allContacts = data;
        this.dataSource.data = data;
        this.cd.markForCheck();
      },
      error: (err) => console.error('Error loading contacts', err)
    });
  }

  applyFilters(): void {
    const text = this.searchQuery.trim().toLowerCase();
    if (text === '' && this.activeFilters.size === 0) {
      this.dataSource.data = this.allContacts.slice();
      this.cd.markForCheck();
      return;
    }
    this.dataSource.data = this.allContacts.filter(contact => {
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
    if (this.paginator) this.paginator.firstPage();
    this.cd.markForCheck();
  }

  newContact(): void { this.router.navigate(['/register']); }
  toggleFilter(f: string): void { this.activeFilters.has(f) ? this.activeFilters.delete(f) : this.activeFilters.add(f); this.applyFilters(); }
  isFilterActive(f: string): boolean { return this.activeFilters.has(f); }
  clearSearch(): void { this.searchQuery = ''; this.applyFilters(); }
  isAdmin(): boolean { return this.authService.isAdmin(); }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  editContact(contact: Contact): void {
    this.editingId = contact.id_contact;
    this.editData = {
      contact_name: contact.contact_name,
      contact_institution: contact.contact_institution || '',
      contact_position: contact.contact_position || '',
      description: contact.description || ''
    };
  }
  cancelEdit(): void { this.editingId = null; }
  saveEdit(): void {
    if (!this.editingId || !this.editData.contact_name.trim()) return;
    this.contactService.updateContact(this.editingId, { ...this.editData, is_active: true }).subscribe({
      next: () => { this.editingId = null; this.loadContacts(); },
      error: (err) => alert(err.error?.error || 'Error al actualizar')
    });
  }

  deleteContact(contact: Contact): void { this.confirmDeleteId = contact.id_contact; }
  cancelDelete(): void { this.confirmDeleteId = null; }
  confirmDelete(id: number): void {
    this.contactService.deactivateContact(id).subscribe({
      next: () => { this.confirmDeleteId = null; this.loadContacts(); },
      error: (err) => alert(err.error?.error || 'Error al eliminar')
    });
  }

  exportCSV(): void {
    const allData = this.dataSource.filteredData;
    const data = allData.map(c => ({
      Nombre: c.contact_name || '',
      Institucion: c.contact_institution || 'INDEPENDIENTE',
      Cargo: c.contact_position || '',
      Telefonos: c.phones?.map(p => p.phone).join(' / ') || '',
      Estado: c.is_active ? 'Activo' : 'Inactivo'
    }));
    const headers = Object.keys(data[0] || {});
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(h => `"${(row as any)[h]}"`).join(','))
    ].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contactos.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  exportPDF(): void {
    const allData = this.dataSource.filteredData;
    const rows = allData.map(c =>
      `<tr>
        <td>${c.contact_name}</td>
        <td>${c.contact_institution || 'INDEPENDIENTE'}</td>
        <td>${c.contact_position || '-'}</td>
        <td>${c.phones?.map(p => p.phone).join(', ') || '-'}</td>
      </tr>`
    ).join('');
    const html = `
      <html><head><title>Agenda de Contactos</title>
      <style>
        body { font-family: Arial; padding: 20px; }
        h1 { text-align: center; color: #102341; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background: #102341; color: white; padding: 10px; text-align: left; }
        td { padding: 8px; border-bottom: 1px solid #ddd; }
        tr:nth-child(even) { background: #f5f5f5; }
      </style></head>
      <body>
        <h1>AGENDA DE CONTACTOS</h1>
        <p>Radio Universitaria y Television Universitaria</p>
        <p>Total: ${allData.length} contactos</p>
        <table>
          <thead><tr><th>Nombre</th><th>Institucion</th><th>Cargo</th><th>Telefonos</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </body></html>
    `;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      setTimeout(() => { win.print(); }, 500);
    }
  }
}