import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {FormBuilder,ReactiveFormsModule,Validators} from '@angular/forms';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  MatSnackBar,
  MatSnackBarModule
} from '@angular/material/snack-bar';

import {
  CreateDeliveryRequest,
  Delivery
} from '../../../core/models/module3.models';

import { DeliveryService } from '../../../core/services/delivery.service';

@Component({
  selector: 'app-delivery-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './delivery-create.html',
  styleUrl: './delivery-create.css'
})
export class DeliveryCreateComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly deliveryService =
    inject(DeliveryService);

  private readonly router =
    inject(Router);

  private readonly snackBar =
    inject(MatSnackBar);

  loading = false;

  errorMessage = '';

  deliveryForm = this.fb.group({

    shipmentId: [
      null as number | null,
      [
        Validators.required,
        Validators.min(1)
      ]
    ],

    driverId: [
      null as number | null,
      [
        Validators.required,
        Validators.min(1)
      ]
    ],

    vehicleId: [
      null as number | null,
      [
        Validators.required,
        Validators.min(1)
      ]
    ],

    routeId: [
      null as number | null,
      [
        Validators.required,
        Validators.min(1)
      ]
    ]

  });

  ngOnInit(): void {
    this.checkRouteParameter();
  }

  // ====================================================
  // CHECK ROUTE PARAMETER
  // ====================================================

  private checkRouteParameter(): void {

    /*
     * This method is intentionally kept simple.
     *
     * Later, when Route/Shipment/Driver/Vehicle
     * APIs are connected, the form can be changed
     * from numeric IDs to dropdown selections.
     */
  }

  // ====================================================
  // FORM VALIDATION
  // ====================================================

  isInvalid(
    controlName: string
  ): boolean {

    const control =
      this.deliveryForm.get(
        controlName
      );

    return !!(
      control &&
      control.invalid &&
      (
        control.dirty ||
        control.touched
      )
    );
  }

  // ====================================================
  // SUBMIT
  // ====================================================

  submit(): void {

    this.errorMessage = '';

    /*
     * Check Angular validation.
     */
    if (this.deliveryForm.invalid) {

      this.deliveryForm.markAllAsTouched();

      this.snackBar.open(
        'Please enter valid shipment, driver, vehicle and route IDs.',
        'Close',
        {
          duration: 3500
        }
      );

      return;
    }

    const formValue =
      this.deliveryForm.getRawValue();

    const request: CreateDeliveryRequest = {

      shipmentId:
        Number(formValue.shipmentId),

      driverId:
        Number(formValue.driverId),

      vehicleId:
        Number(formValue.vehicleId),

      routeId:
        Number(formValue.routeId)

    };

    // ==================================================
    // SERVICE VALIDATION
    // ==================================================

  const validation =
  this.deliveryService.validateDelivery(request);

if (!validation.valid) {

  this.errorMessage =
    validation.message ||
    validation.errors?.join(' ') ||
    'Invalid delivery information.';

  this.snackBar.open(
    this.errorMessage,
    'Close',
    {
      duration: 4000
    }
  );

  return;
}
    // ==================================================
    // CREATE DELIVERY
    // ==================================================

    this.loading = true;

    this.deliveryService
      .createDelivery(request)
      .subscribe({

        next: (delivery: Delivery) => {

          this.loading = false;

          this.snackBar.open(
            'Delivery created successfully.',
            'Close',
            {
              duration: 3000
            }
          );

          /*
           * Navigate to newly-created delivery.
           */
          if (delivery?.id) {

            this.router.navigate([
              '/deliveries',
              delivery.id
            ]);

          } else {

            this.router.navigate([
              '/deliveries'
            ]);

          }
        },

        error: (error) => {

          console.error(
            'Error creating delivery:',
            error
          );

          this.loading = false;

          this.errorMessage =
            error?.message ||
            'Unable to create delivery.';

          this.snackBar.open(
            this.errorMessage,
            'Close',
            {
              duration: 4000
            }
          );
        }

      });
  }

  // ====================================================
  // CANCEL
  // ====================================================

  cancel(): void {

    if (this.loading) {
      return;
    }

    this.router.navigate([
      '/deliveries'
    ]);
  }

  // ====================================================
  // RESET
  // ====================================================

  resetForm(): void {

    if (this.loading) {
      return;
    }

    this.deliveryForm.reset();

    this.errorMessage = '';
  }

}