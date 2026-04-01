import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
	selector: 'app-login',
	standalone: true,
	imports: [FormsModule, CommonModule, MatButtonModule, MatFormFieldModule, MatInputModule, RouterModule],
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.css']
})
export class LoginComponent {
	ci: string = '';
	password: string = '';
	requirePassword: boolean = false;

	constructor(private router: Router, private authService: AuthService) { }

	ingresar() {
		if (!this.ci.trim()) {
			alert('INGRESE SU C.I.');
			return;
		}

		if (!this.requirePassword) {
			this.authService.checkCI(this.ci).subscribe({
				next: (res: any) => {
					if (res.role === 'usuario') {
						this.router.navigate(['/contacts']);
					}
					if (res.role === 'admin') {
						this.requirePassword = true;
						setTimeout(() => document.getElementById('passwordInput')?.focus(), 0);
					}
				},
				error: (err: any) => {
					alert(err.error?.error || 'Error al verificar C.I.');
				}
			});
			return;
		}

		if (!this.password) {
			alert('Ingrese su contraseña');
			return;
		}

		this.authService.login(this.ci, this.password).subscribe({
			next: (res: any) => {
				if (res.role === 'admin') {
					this.router.navigate(['/dashboard']);
				} else {
					this.router.navigate(['/contacts']);
				}
			},
			error: (err: any) => {
				alert(err.error?.error || 'Error al iniciar sesion');
			}
		});
	}
}