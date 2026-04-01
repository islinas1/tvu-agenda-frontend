import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { UserService } from '../../../services/user.service';
import { User } from '../../../interfaces/user.interface';

@Component({
	selector: 'app-users',
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		CommonModule, FormsModule, MatButtonModule, MatFormFieldModule,
		MatIconModule, MatInputModule, MatTableModule
	],
	templateUrl: './users.component.html',
	styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
	private userService = inject(UserService);
	private cd = inject(ChangeDetectorRef);

	searchQuery: string = '';
	allUsers: User[] = [];
	filteredUsers: User[] = [];
	displayedColumns: string[] = ['name', 'last_name', 'role', 'ci', 'expiration_date', 'is_active', 'actions'];

	ngOnInit(): void {
		this.loadUsers();
	}

	loadUsers(): void {
		this.userService.getUsers().subscribe({
			next: (data) => {
				this.allUsers = data;
				this.filteredUsers = data.slice();
				this.cd.markForCheck();
			},
			error: (err) => console.error('Error loading users', err)
		});
	}

	applyFilters(): void {
		const text = this.searchQuery.trim().toLowerCase();
		if (text === '') {
			this.filteredUsers = this.allUsers.slice();
			this.cd.markForCheck();
			return;
		}
		this.filteredUsers = this.allUsers.filter(user =>
			user.name?.toLowerCase().includes(text) ||
			user.last_name?.toLowerCase().includes(text) ||
			user.ci?.toString().includes(text) ||
			user.role?.toLowerCase().includes(text)
		);
		this.cd.markForCheck();
	}

	clearSearch(): void {
		this.searchQuery = '';
		this.applyFilters();
	}

	// FUNCIONAL: activar/desactivar usuario
	cambiarEstado(usuario: User): void {
		if (usuario.is_active) {
			this.userService.deactivateUser(usuario.id_user).subscribe({
				next: () => this.loadUsers(),
				error: (err) => {
					console.error('Error al desactivar', err);
					alert(err.error?.error || 'Error al desactivar usuario');
				}
			});
		} else {
			this.userService.activateUser(usuario.id_user).subscribe({
				next: () => this.loadUsers(),
				error: (err) => {
					console.error('Error al activar', err);
					alert(err.error?.error || 'Error al activar usuario');
				}
			});
		}
	}
}