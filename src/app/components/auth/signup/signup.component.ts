import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { UserService } from '../../../services/user.service';

@Component({
	selector: 'app-registrarse',
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		MatButtonModule,
		MatFormFieldModule,
		MatInputModule,
		MatIconModule,
		MatCardModule
	],
	templateUrl: './signup.component.html',
	styleUrls: ['./signup.component.css']
})
export class SignupComponent {
	nombre: string = '';
	apellido: string = '';
	ci: string = '';
	loading: boolean = false;
	errorMessage: string = '';
	registroExitoso: boolean = false;

	constructor(private router: Router, private userService: UserService) {}

	registrar(): void {
		if (!this.nombre.trim() || !this.apellido.trim() || !this.ci.trim()) {
			this.errorMessage = 'Complete todos los campos';
			return;
		}

		this.errorMessage = '';
		this.loading = true;

		this.userService.signup({
			name: this.nombre,
			last_name: this.apellido,
			ci: Number(this.ci)
		}).subscribe({
			next: () => {
				this.loading = false;
				this.registroExitoso = true;
			},
			error: (err: any) => {
				this.loading = false;
				this.errorMessage = err.error?.error || 'Error al registrarse';
			}
		});
	}

	limpiarFormulario(): void {
		this.nombre = '';
		this.apellido = '';
		this.ci = '';
		this.registroExitoso = false;
		this.errorMessage = '';
	}

	irAlLogin(): void {
		this.router.navigate(['/login']);
	}
}