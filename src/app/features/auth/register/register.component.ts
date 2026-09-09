import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/services/auth.service';
import { ApiErrorService } from '../../../core/services/api-error.service';

@Component({
  selector: 'app-register', standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './register.component.html', styleUrl: './register.component.css'
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly errors = inject(ApiErrorService);
  readonly form = this.fb.nonNullable.group({
    firstName: ['', Validators.required], lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]], password: ['', [Validators.required, Validators.minLength(8)]],
    phoneNumber: [''], companyName: ['']
  });
  loading=false; error='';
  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading=true; this.error='';
    this.auth.register(this.form.getRawValue()).subscribe({
      next: () => { this.loading=false; void this.router.navigate(['/customer/dashboard']); },
      error: e => { this.loading=false; this.error=this.errors.message(e); }
    });
  }
}
