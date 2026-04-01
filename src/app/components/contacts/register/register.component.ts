import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { FormArray } from '@angular/forms';
import { ContactService } from '../../../services/contact.service';
import { Contact } from '../../../interfaces/contact.interface';
import { Router } from '@angular/router';

@Component({
	selector: 'app-formulario-registrar',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		MatFormFieldModule,
		MatInputModule,
		MatButtonModule,
		MatIconModule,
		MatCardModule
	],
	templateUrl: './register.component.html',
	styleUrl: './register.component.css'
})
export class RegisterComponent {
	private router = inject(Router);
	private contactService = inject(ContactService);

	formulario: FormGroup;
	datosGuardados: any = null;

	constructor(private fb: FormBuilder) {
		this.formulario = this.fb.group({
			nombre: ['', [Validators.required, Validators.minLength(2)]],
			institucion: ['', [Validators.required, Validators.minLength(2)]],
			cargo: ['', [Validators.required, Validators.minLength(2)]],
			telefonos: this.fb.array([
				this.fb.control('', [Validators.required, Validators.pattern(/^[0-9]{7,10}$/)])
			])
		});
	}

	// guardar contacto en la base de datos a través del servicio ContactService
	createContact(): void {
		if (this.formulario.invalid) {
			this.formulario.markAllAsTouched();
			return;
		}

		const telefonosValidos = this.formulario.value.telefonos
			.filter((t: string) => t && t.trim() !== '');

		if (telefonosValidos.length === 0) {
			alert('Debe ingresar al menos un teléfono válido');
			return;
		}

		const nuevoContacto = {
			contact_name: this.formulario.value.nombre,
			contact_institution: this.formulario.value.institucion,
			contact_position: this.formulario.value.cargo,
			description: '',
			created_by: 1,
			phones: telefonosValidos.map((t: string) => ({
				phone: t
			}))
		};

		this.contactService.createContact(nuevoContacto).subscribe({
			next: (contact) => {
				console.log('Contacto creado:', contact);
				this.datosGuardados = contact;
				this.limpiarFormulario();
			},
			error: (err) => console.error('Error al crear contacto', err)
		});
	}

	get telefonos(): FormArray {
		return this.formulario.get('telefonos') as FormArray;
	}

	addPhone(): void {
		this.telefonos.push(
			this.fb.control('', [Validators.required, Validators.pattern(/^[0-9]{7,10}$/)])
		);
	}

	removePhone(index: number): void {
		if (this.telefonos.length > 1) {
			this.telefonos.removeAt(index);
		}
	}

	backToList(): void {
		this.router.navigate(['/contacts']);
	}

	limpiarFormulario(): void {
		this.formulario.reset({
			nombre: '',
			institucion: '',
			telefono: '',
			cargo: ''
		});
		this.datosGuardados = null;
	}

}