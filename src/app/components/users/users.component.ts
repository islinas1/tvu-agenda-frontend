import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
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
		MatTableModule,
		MatSelectModule
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

	showForm: boolean = false;
	formData = { name: '', last_name: '', ci: '', id_role: 2, password: '' };
	formError: string = '';
	formSuccess: string = '';

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
		if (text === '') {
			this.filteredUsers = this.allUsers;
			return;
		}
		this.filteredUsers = this.allUsers.filter(user =>
			user.name?.toLowerCase().includes(text) ||
			user.last_name?.toLowerCase().includes(text) ||
			user.ci?.toString().includes(text) ||
			user.role?.toLowerCase().includes(text)
		);
	}

	clearSearch(): void {
		this.searchQuery = '';
		this.applyFilters();
	}

	cambiarEstado(usuario: User): void {
		if (usuario.is_active) {
			this.userService.deactivateUser(usuario.id_user).subscribe({
				next: () => this.loadUsers(),
				error: (err) => console.error('Error al desactivar', err)
			});
		} else {
			this.userService.updateUser(usuario.id_user, {
				id_role: usuario.role === 'ADMINISTRADOR' ? 1 : 2,
				name: usuario.name,
				last_name: usuario.last_name,
				ci: usuario.ci,
				is_active: true,
				expiration_date: usuario.expiration_date
			}).subscribe({
				next: () => this.loadUsers(),
				error: (err) => console.error('Error al activar', err)
			});
		}
	}

	abrirFormulario(): void {
		this.formData = { name: '', last_name: '', ci: '', id_role: 2, password: '' };
		this.formError = '';
		this.formSuccess = '';
		this.showForm = true;
	}

	cancelarFormulario(): void {
		this.showForm = false;
		this.formError = '';
		this.formSuccess = '';
	}

	guardarUsuario(): void {
		if (!this.formData.name.trim() || !this.formData.last_name.trim() || !this.formData.ci.toString().trim()) {
			this.formError = 'Nombre, apellido y CI son obligatorios';
			return;
		}
		this.formError = '';

		this.userService.createUser({
			name: this.formData.name,
			last_name: this.formData.last_name,
			ci: Number(this.formData.ci),
			id_role: this.formData.id_role,
			password: this.formData.password || this.formData.ci,
			is_active: true
		} as any).subscribe({
			next: () => {
				this.formSuccess = 'Usuario creado exitosamente';
				this.loadUsers();
				setTimeout(() => this.cancelarFormulario(), 1200);
			},
			error: (err) => this.formError = err.error?.error || 'Error al crear usuario'
		});
	}
}