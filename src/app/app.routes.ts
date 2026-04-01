import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { DashboardPrincipalComponent } from './components/admin/dashboard/dashboard.component';
import { ContactsComponent } from './components/contacts/list/list.component';
import { UsersComponent } from './components/admin/users/users.component';
import { RegisterComponent } from './components/contacts/register/register.component';
import { SignupComponent } from './components/auth/signup/signup.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },

  // SOLO LOGUEADOS
  { path: 'contacts', component: ContactsComponent, canActivate: [authGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [authGuard] },

  // SOLO ADMIN
  { path: 'dashboard', component: DashboardPrincipalComponent, canActivate: [authGuard, adminGuard] },
  { path: 'users', component: UsersComponent, canActivate: [authGuard, adminGuard] },

  { path: '**', redirectTo: '/login' },
];