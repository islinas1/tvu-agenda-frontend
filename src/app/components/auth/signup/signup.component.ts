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
	countdown: number = 5;

	constructor(private router: Router, private userService: UserService) {}

	toUpper(field: 'nombre' | 'apellido'): void {
		this[field] = this[field].toUpperCase();
	}

	registrar(): void {
		if (!this.nombre.trim() || !this.apellido.trim() || !this.ci.trim()) {
			this.errorMessage = 'Complete todos los campos';
			return;
		}

		this.errorMessage = '';
		this.loading = true;

		this.userService.signup({
			name: this.nombre.toUpperCase(),
			last_name: this.apellido.toUpperCase(),
			ci: Number(this.ci)
		}).subscribe({
			next: () => {
				this.loading = false;
				this.registroExitoso = true;
				// Cuenta regresiva y redirigir al login
				this.iniciarCuentaRegresiva();
			},
			error: (err: any) => {
				this.loading = false;
				this.errorMessage = err.error?.error || 'Error al registrarse';
			}
		});
	}

	iniciarCuentaRegresiva(): void {
		this.countdown = 5;
		const interval = setInterval(() => {
			this.countdown--;
			if (this.countdown <= 0) {
				clearInterval(interval);
				this.router.navigate(['/login']);
			}
		}, 1000);
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