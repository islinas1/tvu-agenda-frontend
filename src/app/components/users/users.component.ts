import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { UserService } from '../../services/user.service';
import { User } from '../../interfaces/user.interface';

@Component({
	selector: 'app-users',
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		MatButtonModule,
		MatFormFieldModule,
		MatIconModule,
		MatInputModule,
		MatTableModule
	],
	templateUrl: './users.component.html',
	styleUrls: ['./users.component.css']
})

export class UsersComponent implements OnInit {
	private userService = inject(UserService);
	private cd = inject(ChangeDetectorRef);

	searchQuery: string = '';
	activeFilters: Set<string> = new Set();
	allUsers: User[] = [];
	filteredUsers: User[] = [];
	displayedColumns: string[] = ['name', 'last_name', 'role', 'ci', 'expiration_date', 'is_active',  'actions'];

	ngOnInit(): void {
		this.loadUsers();
	}

	loadUsers(): void {
		this.userService.getUsers().subscribe({
			next: (data) => {
				this.allUsers = data;
				this.applyFilters();
				this.cd.detectChanges();
			},
			error: (err) => console.error('Error loading users', err)
		});
	}

	applyFilters(): void {
		const text = this.searchQuery.trim().toLowerCase();

		// Si no hay búsqueda ni filtros activos, mostrar todos
		if (text === '' && this.activeFilters.size === 0) {
			this.filteredUsers = this.allUsers;
			return;
		}

		this.filteredUsers = this.allUsers.filter(user => {
			// Filtrado por botones activos
			if (this.activeFilters.size > 0) {
				return Array.from(this.activeFilters).some(filter => {
					if (filter === 'name') return user.name?.toLowerCase().includes(text);
					//if (filter === 'institution') return user.user_institution?.toLowerCase().includes(text);
					//if (filter === 'position') return user.user_position?.toLowerCase().includes(text);
					return false;
				});
			}

			// Búsqueda global si no hay botones activos
			return (
				user.name?.toLowerCase().includes(text) ||
				user.last_name?.toLowerCase().includes(text) ||
				user.ci.toString().includes(text) ||
				user.expiration_date.toString().includes(text) ||
				user.is_active.toString().includes(text) ||
				user.role.toLowerCase().includes(text)
			);
		});
	}
	cambiarEstado(usuario: User): void {
		//usuario.estado = usuario.estado === 'Activo' ? 'Inactivo' : 'Activo';
	}
	clearSearch(): void {
    this.searchQuery = '';
    this.applyFilters();
  }
}
