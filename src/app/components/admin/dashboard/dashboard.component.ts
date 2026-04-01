import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';

@Component({
	selector: 'app-dashboard-principal',
	standalone: true,
	imports: [
		CommonModule,
		MatButtonModule,
		MatCardModule,
		MatIconModule,
		RouterModule,
	],
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.css']
})
export class DashboardPrincipalComponent {


	constructor(private router: Router) { }

	abrirControlUsuarios(): void {
		this.router.navigate(['/users']);
	}

	abrirContactos(): void {
		this.router.navigate(['/contacts']);
	}

	volverInicio(): void {
		//this.vistaActiva = 'principal';
	}
}