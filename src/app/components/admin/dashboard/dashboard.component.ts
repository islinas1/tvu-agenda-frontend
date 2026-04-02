import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
	selector: 'app-dashboard-principal',
	standalone: true,
	imports: [
		CommonModule, FormsModule, MatButtonModule, MatCardModule,
		MatIconModule, MatFormFieldModule, MatInputModule, RouterModule,
	],
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.css']
})
export class DashboardPrincipalComponent {
	showChangePassword: boolean = false;
	currentPassword: string = '';
	newPassword: string = '';
	confirmPassword: string = '';
	passwordMessage: string = '';
	passwordMessageType: 'exito' | 'error' | '' = '';

	constructor(
		private router: Router,
		private authService: AuthService,
		private cd: ChangeDetectorRef
	) { }

	get userName(): string {
		return this.authService.getUserName();
	}

	abrirControlUsuarios(): void {
		this.router.navigate(['/users']);
	}

	abrirContactos(): void {
		this.router.navigate(['/contacts']);
	}

	cerrarSesion(): void {
		this.authService.logout();
		this.router.navigate(['/login']);
	}

	toggleChangePassword(): void {
		this.showChangePassword = !this.showChangePassword;
		this.currentPassword = '';
		this.newPassword = '';
		this.confirmPassword = '';
		this.passwordMessage = '';
		this.passwordMessageType = '';
		this.cd.detectChanges();
	}

	cambiarcontrasena(): void {
		if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
			this.passwordMessage = 'Complete todos los campos';
			this.passwordMessageType = 'error';
			return;
		}
		if (this.newPassword !== this.confirmPassword) {
			this.passwordMessage = 'Las contraseñas no coinciden';
			this.passwordMessageType = 'error';
			return;
		}
		if (this.newPassword.length < 4) {
			this.passwordMessage = 'Minimo 4 caracteres';
			this.passwordMessageType = 'error';
			return;
		}

		this.authService.changePassword(this.currentPassword, this.newPassword).subscribe({
			next: () => {
				this.passwordMessage = 'contraseña actualizada. Proxima expiracion en 90 dias.';
				this.passwordMessageType = 'exito';
				this.cd.detectChanges();
				setTimeout(() => {
					this.showChangePassword = false;
					this.passwordMessage = '';
					this.passwordMessageType = '';
					this.currentPassword = '';
					this.newPassword = '';
					this.confirmPassword = '';
					this.cd.detectChanges();
				}, 2000);
			},
			error: (err: any) => {
				this.passwordMessage = err.error?.error || 'Error al cambiar contraseña';
				this.passwordMessageType = 'error';
				this.cd.detectChanges();
			}
		});
	}
}