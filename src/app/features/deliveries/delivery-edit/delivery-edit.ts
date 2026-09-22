import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

import {
  Delivery,
  DeliveryStatus,
  UpdateDeliveryRequest
} from '../../../core/models/module3.models';

import { DeliveryService } from '../../../core/services/delivery.service';

@Component({
  selector: 'app-delivery-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './delivery-edit.html',
  styleUrls: ['./delivery-edit.css']
})
export class DeliveryEditComponent implements OnInit {

  deliveryForm!: FormGroup;

  delivery: Delivery | null = null;

  deliveryId = 0;

  loading = false;
  saving = false;

  errorMessage = '';
  successMessage = '';

  readonly statuses: DeliveryStatus[] = [
    'Pending',
    'PickupConfirmed',
    'OutForDelivery',
    'Completed',
    'Failed'
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly deliveryService: DeliveryService
  ) {}

  ngOnInit(): void {
    this.initializeForm();

    const idParam = this.route.snapshot.paramMap.get('id');

    if (!idParam) {
      this.errorMessage = 'Delivery ID was not provided.';
      return;
    }

    this.deliveryId = Number(idParam);

    if (!Number.isInteger(this.deliveryId) || this.deliveryId <= 0) {
      this.errorMessage = 'Invalid delivery ID.';
      return;
    }

    this.loadDelivery();
  }

  private initializeForm(): void {
    this.deliveryForm = this.fb.group({
      shipmentId: [
        null,
        [
          Validators.required,
          Validators.min(1)
        ]
      ],

      driverId: [
        null,
        [
          Validators.required,
          Validators.min(1)
        ]
      ],

      vehicleId: [
        null,
        [
          Validators.required,
          Validators.min(1)
        ]
      ],

      routeId: [
        null,
        [
          Validators.required,
          Validators.min(1)
        ]
      ],

      status: [
        'Pending',
        Validators.required
      ]
    });
  }

  loadDelivery(): void {
    this.loading = true;
    this.errorMessage = '';

    this.deliveryService.getDeliveryById(this.deliveryId).subscribe({
      next: (delivery) => {
        this.delivery = delivery;

        this.deliveryForm.patchValue({
          shipmentId: delivery.shipmentId,
          driverId: delivery.driverId,
          vehicleId: delivery.vehicleId,
          routeId: delivery.routeId,
          status: delivery.status
        });

        this.loading = false;
      },

      error: (error) => {
        this.loading = false;

        this.errorMessage =
          error?.message || 'Unable to load delivery.';
      }
    });
  }

  submit(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.deliveryForm.invalid) {
      this.deliveryForm.markAllAsTouched();

      this.errorMessage =
        'Please correct the validation errors before saving.';

      return;
    }

    const request: UpdateDeliveryRequest = {
      shipmentId: Number(this.deliveryForm.value.shipmentId),
      driverId: Number(this.deliveryForm.value.driverId),
      vehicleId: Number(this.deliveryForm.value.vehicleId),
      routeId: Number(this.deliveryForm.value.routeId),
      status: this.deliveryForm.value.status as DeliveryStatus
    };

    const validation =
      this.deliveryService.validateDelivery({
        shipmentId: request.shipmentId,
        driverId: request.driverId,
        vehicleId: request.vehicleId,
        routeId: request.routeId
      });

    if (!validation.valid) {
      this.errorMessage =
        validation.message || 'Invalid delivery information.';

      return;
    }

    this.saving = true;

    this.deliveryService
      .updateDelivery(this.deliveryId, request)
      .subscribe({
        next: (updatedDelivery) => {
          this.saving = false;
          this.delivery = updatedDelivery;

          this.successMessage =
            'Delivery updated successfully.';

          setTimeout(() => {
            this.router.navigate([
              '/deliveries',
              this.deliveryId
            ]);
          }, 700);
        },

        error: (error) => {
          this.saving = false;

          this.errorMessage =
            error?.message || 'Failed to update delivery.';
        }
      });
  }

  cancel(): void {
    this.router.navigate([
      '/deliveries',
      this.deliveryId
    ]);
  }

  resetForm(): void {
    if (!this.delivery) {
      return;
    }

    this.deliveryForm.patchValue({
      shipmentId: this.delivery.shipmentId,
      driverId: this.delivery.driverId,
      vehicleId: this.delivery.vehicleId,
      routeId: this.delivery.routeId,
      status: this.delivery.status
    });

    this.errorMessage = '';
    this.successMessage = '';
  }

  getControlError(
    controlName: string
  ): string {
    const control = this.deliveryForm.get(controlName);

    if (!control || !control.touched) {
      return '';
    }

    if (control.hasError('required')) {
      return 'This field is required.';
    }

    if (control.hasError('min')) {
      return 'Value must be greater than 0.';
    }

    return '';
  }

  getStatusLabel(status: DeliveryStatus): string {
    return this.deliveryService.getStatusLabel(status);
  }
}