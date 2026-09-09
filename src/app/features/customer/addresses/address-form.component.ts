import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';

import { CustomerService } from '../../../core/services/customer.service';
import { ApiErrorService } from '../../../core/services/api-error.service';

@Component({
  selector: 'app-address-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule
  ],
  templateUrl: './address-form.component.html',
  styleUrl: './address-form.component.css'
})
export class AddressFormComponent {

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(CustomerService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly errors = inject(ApiErrorService);

  readonly form = this.fb.nonNullable.group({
    addressLine1: ['', Validators.required],
    addressLine2: [''],
    city: ['', Validators.required],
    state: ['', Validators.required],
    postalCode: ['', Validators.required],
    country: ['India', Validators.required],
    isDefault: [false]
  });

  id: number | null = null;
  loading = false;
  error = '';

  get editing(): boolean {
    return this.id !== null;
  }

  ngOnInit(): void {
    const raw = this.route.snapshot.paramMap.get('id');

    this.id = raw ? Number(raw) : null;

    if (this.id) {
      this.loading = true;

      this.service.getAddresses().subscribe({
        next: addresses => {
          const address = addresses.find(
            value => value.id === this.id
          );

          if (address) {
            this.form.patchValue({
              addressLine1: address.addressLine1 ?? '',
              addressLine2: address.addressLine2 ?? '',
              city: address.city ?? '',
              state: address.state ?? '',
              postalCode: address.postalCode ?? '',
              country: address.country ?? '',
              isDefault: address.isDefault ?? false
            });
          }

          this.loading = false;
        },

        error: e => {
          this.loading = false;
          this.error = this.errors.message(e);
        }
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    const request = this.form.getRawValue();

    const operation = this.id
      ? this.service.updateAddress(this.id, request)
      : this.service.addAddress(request);

    operation.subscribe({
      next: () => {
        this.loading = false;

        void this.router.navigate([
          '/customer/addresses'
        ]);
      },

      error: e => {
        this.loading = false;
        this.error = this.errors.message(e);
      }
    });
  }
}