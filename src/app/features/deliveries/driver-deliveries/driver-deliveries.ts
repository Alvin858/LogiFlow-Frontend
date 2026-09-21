import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';

import {
  Delivery,
  DeliveryStatus
} from '../../../core/models/module3.models';

import { DeliveryService } from '../../../core/services/delivery.service';

@Component({
  selector: 'app-driver-deliveries',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTableModule
  ],
  templateUrl: './driver-deliveries.html',
  styleUrls: ['./driver-deliveries.css']
})
export class DriverDeliveriesComponent implements OnInit {

  deliveries: Delivery[] = [];

  driverId: number | null = null;

  loading = false;
  actionLoading = false;

  errorMessage = '';

  displayedColumns: string[] = [
    'id',
    'shipmentId',
    'vehicleId',
    'routeId',
    'status',
    'actions'
  ];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly deliveryService: DeliveryService,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const driverIdParam =
      this.route.snapshot.paramMap.get('driverId');

    if (driverIdParam) {
      const parsedId = Number(driverIdParam);

      if (
        Number.isInteger(parsedId) &&
        parsedId > 0
      ) {
        this.driverId = parsedId;
      }
    }

    this.loadDeliveries();
  }

  loadDeliveries(): void {
    this.loading = true;
    this.errorMessage = '';

    this.deliveryService.getDeliveries().subscribe({
      next: (deliveries) => {

        if (this.driverId !== null) {
          this.deliveries = deliveries.filter(
            delivery =>
              delivery.driverId === this.driverId
          );
        } else {
          this.deliveries = deliveries;
        }

        this.loading = false;
      },

      error: (error) => {
        this.loading = false;

        this.errorMessage =
          error?.message ||
          'Unable to load driver deliveries.';
      }
    });
  }

  viewDelivery(delivery: Delivery): void {
    if (!delivery.id) {
      return;
    }

    this.router.navigate([
      '/deliveries',
      delivery.id
    ]);
  }

  confirmPickup(delivery: Delivery): void {
    if (!delivery.id) {
      return;
    }

    if (!this.deliveryService.canConfirmPickup(delivery)) {
      this.showMessage(
        'Pickup confirmation is not available.'
      );
      return;
    }

    this.actionLoading = true;

    this.deliveryService
      .confirmPickup(delivery.id)
      .subscribe({
        next: (updatedDelivery) => {
          this.replaceDelivery(updatedDelivery);
          this.actionLoading = false;

          this.showMessage(
            'Pickup confirmed successfully.'
          );
        },

        error: (error) => {
          this.actionLoading = false;

          this.showMessage(
            error?.message ||
            'Failed to confirm pickup.'
          );
        }
      });
  }

  markOutForDelivery(delivery: Delivery): void {
    if (!delivery.id) {
      return;
    }

    if (
      !this.deliveryService.canMarkOutForDelivery(
        delivery
      )
    ) {
      this.showMessage(
        'Delivery cannot be started from the current status.'
      );
      return;
    }

    this.actionLoading = true;

    this.deliveryService
      .markOutForDelivery(delivery.id)
      .subscribe({
        next: (updatedDelivery) => {
          this.replaceDelivery(updatedDelivery);
          this.actionLoading = false;

          this.showMessage(
            'Delivery marked as out for delivery.'
          );
        },

        error: (error) => {
          this.actionLoading = false;

          this.showMessage(
            error?.message ||
            'Failed to update delivery status.'
          );
        }
      });
  }

  completeDelivery(delivery: Delivery): void {
    if (!delivery.id) {
      return;
    }

    if (
      !this.deliveryService.canCompleteDelivery(
        delivery
      )
    ) {
      this.showMessage(
        'This delivery cannot be completed yet.'
      );
      return;
    }

    const confirmed = window.confirm(
      `Complete delivery #${delivery.id}?`
    );

    if (!confirmed) {
      return;
    }

    this.actionLoading = true;

    this.deliveryService
      .completeDelivery(delivery.id)
      .subscribe({
        next: (updatedDelivery) => {
          this.replaceDelivery(updatedDelivery);
          this.actionLoading = false;

          this.showMessage(
            'Delivery completed successfully.'
          );
        },

        error: (error) => {
          this.actionLoading = false;

          this.showMessage(
            error?.message ||
            'Failed to complete delivery.'
          );
        }
      });
  }

  failDelivery(delivery: Delivery): void {
    if (!delivery.id) {
      return;
    }

    if (!this.deliveryService.canFailDelivery(delivery)) {
      this.showMessage(
        'This delivery cannot be marked as failed.'
      );
      return;
    }

    const reason = window.prompt(
      'Enter the failure reason:'
    );

    if (reason === null) {
      return;
    }

    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      this.showMessage(
        'Failure reason is required.'
      );
      return;
    }

    this.actionLoading = true;

    this.deliveryService
      .failDelivery(
        delivery.id,
        trimmedReason
      )
      .subscribe({
        next: (updatedDelivery) => {
          this.replaceDelivery(updatedDelivery);
          this.actionLoading = false;

          this.showMessage(
            'Delivery marked as failed.'
          );
        },

        error: (error) => {
          this.actionLoading = false;

          this.showMessage(
            error?.message ||
            'Failed to update delivery.'
          );
        }
      });
  }

  openProofOfDelivery(
    delivery: Delivery
  ): void {
    if (!delivery.id) {
      return;
    }

    this.router.navigate([
      '/deliveries',
      delivery.id,
      'proof-of-delivery'
    ]);
  }

  getStatusLabel(
    status: DeliveryStatus | string
  ): string {
    return this.deliveryService.getStatusLabel(
      status as DeliveryStatus
    );
  }

  getStatusClass(
    status: DeliveryStatus | string
  ): string {
    switch (status) {
      case 'Pending':
        return 'status-pending';

      case 'PickupConfirmed':
        return 'status-pickup';

      case 'OutForDelivery':
        return 'status-out';

      case 'Completed':
        return 'status-completed';

      case 'Failed':
        return 'status-failed';

      default:
        return 'status-unknown';
    }
  }

  canConfirmPickup(
    delivery: Delivery
  ): boolean {
    return this.deliveryService.canConfirmPickup(
      delivery
    );
  }

  canMarkOutForDelivery(
    delivery: Delivery
  ): boolean {
    return this.deliveryService.canMarkOutForDelivery(
      delivery
    );
  }

  canCompleteDelivery(
    delivery: Delivery
  ): boolean {
    return this.deliveryService.canCompleteDelivery(
      delivery
    );
  }

  canFailDelivery(
    delivery: Delivery
  ): boolean {
    return this.deliveryService.canFailDelivery(
      delivery
    );
  }

  canAddProofOfDelivery(
    delivery: Delivery
  ): boolean {
    return this.deliveryService.canAddProofOfDelivery(
      delivery
    );
  }

  getActiveCount(): number {
    return this.deliveries.filter(
      delivery =>
        delivery.status !== 'Completed' &&
        delivery.status !== 'Failed'
    ).length;
  }

  getCompletedCount(): number {
    return this.deliveries.filter(
      delivery =>
        delivery.status === 'Completed'
    ).length;
  }

  getFailedCount(): number {
    return this.deliveries.filter(
      delivery =>
        delivery.status === 'Failed'
    ).length;
  }

  private replaceDelivery(
    updatedDelivery: Delivery
  ): void {
    const index = this.deliveries.findIndex(
      delivery =>
        delivery.id === updatedDelivery.id
    );

    if (index === -1) {
      this.deliveries.push(updatedDelivery);
      return;
    }

    this.deliveries[index] = updatedDelivery;

    this.deliveries = [
      ...this.deliveries
    ];
  }

  trackByDeliveryId(
    index: number,
    delivery: Delivery
  ): number {
    return delivery.id ?? index;
  }

  refresh(): void {
    this.loadDeliveries();
  }

  goToAllDeliveries(): void {
    this.router.navigate([
      '/deliveries'
    ]);
  }

  private showMessage(
    message: string
  ): void {
    this.snackBar.open(
      message,
      'Close',
      {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top'
      }
    );
  }
}