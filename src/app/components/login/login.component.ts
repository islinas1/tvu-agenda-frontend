import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
	selector: 'app-login',
	standalone: true,
	imports: [FormsModule, CommonModule, MatButtonModule, MatFormFieldModule, MatInputModule],
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.css']
})
export class LoginComponent {
	ci: string = '';
	password: string = '';
	requirePassword: boolean = false;
	loading: boolean = false;
	errorMessage: string = '';

	constructor(private router: Router, private authService: AuthService) { }

	ingresar() {
		// Evitar multiples clics mientras se procesa
		if (this.loading) return;

		if (!this.ci.trim()) {
			this.errorMessage = 'Ingrese su C.I.';
			return;
		}

		this.errorMessage = '';

		// FASE 1: Solo se ingreso el C.I., verificar rol
		if (!this.requirePassword) {
			this.loading = true;
			this.authService.checkCI(this.ci).subscribe({
				next: (res: any) => {
					this.loading = false;
					if (res.role === 'usuario') {
						this.router.navigate([res.redirect]);
					}
					if (res.role === 'admin') {
						this.requirePassword = true;
						setTimeout(() => document.getElementById('passwordInput')?.focus(), 100);
					}
				},
				error: (err: any) => {
					this.loading = false;
					this.errorMessage = err.error?.error || 'Error al verificar C.I.';
				}
			});
			return;
		}

		// FASE 2: Admin ya ingreso C.I., ahora pone contraseña
		if (!this.password) {
			this.errorMessage = 'Ingrese su contraseña';
			return;
		}

		this.loading = true;
		this.authService.login(this.ci, this.password).subscribe({
			next: (res: any) => {
				this.loading = false;
				this.router.navigate([res.redirect]);
			},
			error: (err: any) => {
				this.loading = false;
				this.errorMessage = err.error?.error || 'Error al iniciar sesion';
			}
		});
	}
}