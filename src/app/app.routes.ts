import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { AppShellComponent } from './shared/layout/app-shell/app-shell.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './features/auth/reset-password/reset-password.component';
import { ChangePasswordComponent } from './features/auth/change-password/change-password.component';
import { AccessDeniedComponent } from './features/auth/access-denied/access-denied.component';
import { CustomerDashboardComponent } from './features/customer/dashboard/customer-dashboard.component';
import { CustomerProfileComponent } from './features/customer/profile/customer-profile.component';
import { CustomerProfileEditComponent } from './features/customer/profile-edit/customer-profile-edit.component';
import { CustomerAddressesComponent } from './features/customer/addresses/customer-addresses.component';
import { AddressFormComponent } from './features/customer/addresses/address-form.component';
import { VehicleListComponent } from './features/fleet/vehicles/vehicle-list.component';
import { VehicleFormComponent } from './features/fleet/vehicles/vehicle-form.component';
import { VehicleDetailComponent } from './features/fleet/vehicles/vehicle-detail.component';
import { DriverListComponent } from './features/fleet/drivers/driver-list.component';
import { DriverFormComponent } from './features/fleet/drivers/driver-form.component';
import { DriverDetailComponent } from './features/fleet/drivers/driver-detail.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'auth/login' },
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: 'auth/forgot-password', component: ForgotPasswordComponent },
  { path: 'auth/reset-password', component: ResetPasswordComponent },
  { path: 'auth/access-denied', component: AccessDeniedComponent },
  { path: 'auth/change-password', component: ChangePasswordComponent, canActivate: [authGuard] },

  {
    path: '', component: AppShellComponent, canActivate: [authGuard],
    children: [
      { path: 'customer/dashboard', component: CustomerDashboardComponent, canActivate: [roleGuard(['Customer'])] },
      { path: 'customer/profile', component: CustomerProfileComponent, canActivate: [roleGuard(['Customer'])] },
      { path: 'customer/profile/edit', component: CustomerProfileEditComponent, canActivate: [roleGuard(['Customer'])] },
      { path: 'customer/addresses', component: CustomerAddressesComponent, canActivate: [roleGuard(['Customer'])] },
      { path: 'customer/addresses/add', component: AddressFormComponent, canActivate: [roleGuard(['Customer'])] },
      { path: 'customer/addresses/:id/edit', component: AddressFormComponent, canActivate: [roleGuard(['Customer'])] },

      { path: 'admin/vehicles', component: VehicleListComponent, canActivate: [roleGuard(['Admin', 'Logistics Staff'])] },
      { path: 'admin/vehicles/add', component: VehicleFormComponent, canActivate: [roleGuard(['Admin', 'Logistics Staff'])] },
      { path: 'admin/vehicles/edit/:id', component: VehicleFormComponent, canActivate: [roleGuard(['Admin', 'Logistics Staff'])] },
      { path: 'admin/vehicles/:id', component: VehicleDetailComponent, canActivate: [roleGuard(['Admin', 'Logistics Staff'])] },

      { path: 'admin/drivers', component: DriverListComponent, canActivate: [roleGuard(['Admin', 'Logistics Staff'])] },
      { path: 'admin/drivers/add', component: DriverFormComponent, canActivate: [roleGuard(['Admin', 'Logistics Staff'])] },
      { path: 'admin/drivers/edit/:id', component: DriverFormComponent, canActivate: [roleGuard(['Admin', 'Logistics Staff'])] },
      { path: 'admin/drivers/:id', component: DriverDetailComponent, canActivate: [roleGuard(['Admin', 'Logistics Staff'])] }
    ]
  },
  { path: '**', redirectTo: 'auth/login' }
];
