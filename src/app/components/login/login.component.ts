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

	constructor(private router: Router, private authService: AuthService) { }

	ingresar() {
		if (!this.ci.trim()) {
			alert('INGRESE SU C.I.');
			return;
		}

		if (!this.requirePassword) {
			// Primera fase: detectar rol
			this.authService.checkCI(this.ci).subscribe({
				next: (res: any) => {
					if (res.role === 'usuario') {
						// redirige directo
						this.router.navigate([res.redirect]);
					}
					if (res.role === 'admin') {
						// activa input de contraseña
						this.requirePassword = true;
						setTimeout(() => document.getElementById('passwordInput')?.focus(), 0);
					}
				},
				error: (err: any) => {
					alert(err.error?.error || 'Error al verificar C.I');
				}
			});
			return; 
		}

		// Segunda fase: enviar CI + password
		if (!this.password) {
			alert('Ingrese su contraseña');
			return;
		}

		this.authService.login(this.ci, this.password).subscribe({
			next: (res: any) => {
				this.router.navigate([res.redirect]);
			},
			error: (err: any) => {
				alert(err.error?.error || 'Error al iniciar sesión');
			}
		});
	}

}