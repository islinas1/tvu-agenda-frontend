import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardPrincipalComponent } from './components/dashboard/dashboard.component';
import { ContactsComponent } from './components/contacts/contacts.component';
import { UsersComponent } from './components/users/users.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'contacts', component: ContactsComponent, canActivate: [authGuard] },
  { path: 'users', component: UsersComponent },
	{ path: 'dashboard', component: DashboardPrincipalComponent },
  { path: '**', redirectTo: '/contacts' }
];
