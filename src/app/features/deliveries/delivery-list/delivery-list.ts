import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router} from '@angular/router';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import {MatSnackBar,MatSnackBarModule} from '@angular/material/snack-bar';

import {Delivery,DeliveryStatus} from '../../../core/models/module3.models';

import { DeliveryService } from '../../../core/services/delivery.service';

@Component({
  selector: 'app-delivery-list',
  standalone: true,
  imports: [
     RouterLink,
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  templateUrl: './delivery-list.html',
  styleUrl: './delivery-list.css'
})
export class DeliveryListComponent implements OnInit {

  private readonly deliveryService =
    inject(DeliveryService);

  private readonly router =
    inject(Router);

  private readonly snackBar =
    inject(MatSnackBar);

  // ====================================================
  // TABLE
  // ====================================================

  displayedColumns: string[] = [
    'id',
    'shipmentId',
    'driverId',
    'vehicleId',
    'routeId',
    'status',
    'createdAt',
    'actions'
  ];

  deliveries: Delivery[] = [];

  // ====================================================
  // STATE
  // ====================================================

  loading = false;

  errorMessage = '';

  // ====================================================
  // SUMMARY
  // ====================================================

  totalDeliveries = 0;

  pendingDeliveries = 0;

  pickupConfirmedDeliveries = 0;

  outForDeliveryDeliveries = 0;

  completedDeliveries = 0;

  failedDeliveries = 0;

  // ====================================================
  // INITIALIZE
  // ====================================================

  ngOnInit(): void {
    this.loadDeliveries();
  }

  // ====================================================
  // LOAD DELIVERIES
  // ====================================================

  loadDeliveries(): void {

    this.loading = true;

    this.errorMessage = '';

    this.deliveryService
      .getDeliveries()
      .subscribe({

        next: (deliveries) => {

          this.deliveries =
            deliveries ?? [];

          this.calculateSummary();

          this.loading = false;
        },

        error: (error) => {

          console.error(
            'Error loading deliveries:',
            error
          );

          this.errorMessage =
            error?.message ||
            'Unable to load deliveries.';

          this.loading = false;
        }

      });
  }

  // ====================================================
  // CALCULATE SUMMARY
  // ====================================================

  private calculateSummary(): void {

    const summary =
      this.deliveryService
        .getDeliverySummary(
          this.deliveries
        );

    this.totalDeliveries =
      summary.total;

    this.pendingDeliveries =
      summary.pending;

    this.pickupConfirmedDeliveries =
      summary.pickupConfirmed;

    this.outForDeliveryDeliveries =
      summary.outForDelivery;

    this.completedDeliveries =
      summary.completed;

    this.failedDeliveries =
      summary.failed;
  }

  // ====================================================
  // CREATE DELIVERY
  // ====================================================

  createDelivery(): void {

    this.router.navigate([
      '/deliveries/create'
    ]);
  }

  // ====================================================
  // VIEW DELIVERY
  // ====================================================

  viewDelivery(
    id: number | undefined
  ): void {

    if (!id) {
      return;
    }

    this.router.navigate([
      '/deliveries',
      id
    ]);
  }

  // ====================================================
  // EDIT DELIVERY
  // ====================================================

  editDelivery(
    id: number | undefined
  ): void {

    if (!id) {
      return;
    }

    this.router.navigate([
      '/deliveries/edit',
      id
    ]);
  }

  // ====================================================
  // DELETE DELIVERY
  // ====================================================

  deleteDelivery(
    delivery: Delivery
  ): void {

    if (!delivery.id) {
      return;
    }

    /*
     * Completed deliveries should normally
     * not be deleted from the UI.
     */
    if (
      delivery.status ===
      'Completed'
    ) {

      this.snackBar.open(
        'Completed deliveries cannot be deleted.',
        'Close',
        {
          duration: 3000
        }
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Are you sure you want to delete delivery #${delivery.id}?`
      );

    if (!confirmed) {
      return;
    }

    this.deliveryService
      .deleteDelivery(delivery.id)
      .subscribe({

        next: () => {

          this.snackBar.open(
            'Delivery deleted successfully.',
            'Close',
            {
              duration: 3000
            }
          );

          this.loadDeliveries();
        },

        error: (error) => {

          console.error(
            'Error deleting delivery:',
            error
          );

          this.snackBar.open(
            error?.message ||
            'Unable to delete delivery.',
            'Close',
            {
              duration: 4000
            }
          );
        }

      });
  }

  // ====================================================
  // CONFIRM PICKUP
  // ====================================================

  confirmPickup(
    delivery: Delivery
  ): void {

    if (!delivery.id) {
      return;
    }

    if (
      !this.deliveryService
        .canConfirmPickup(delivery)
    ) {

      this.snackBar.open(
        'Pickup cannot be confirmed for this delivery.',
        'Close',
        {
          duration: 3000
        }
      );

      return;
    }

    this.deliveryService
      .confirmPickup(delivery.id)
      .subscribe({

        next: (updatedDelivery) => {

          this.replaceDelivery(
            updatedDelivery
          );

          this.snackBar.open(
            'Pickup confirmed successfully.',
            'Close',
            {
              duration: 3000
            }
          );

          this.calculateSummary();
        },

        error: (error) => {

          console.error(
            'Pickup confirmation error:',
            error
          );

          this.snackBar.open(
            error?.message ||
            'Unable to confirm pickup.',
            'Close',
            {
              duration: 4000
            }
          );
        }

      });
  }

  // ====================================================
  // MARK OUT FOR DELIVERY
  // ====================================================

  markOutForDelivery(
    delivery: Delivery
  ): void {

    if (!delivery.id) {
      return;
    }

    if (
      !this.deliveryService
        .canMarkOutForDelivery(
          delivery
        )
    ) {

      this.snackBar.open(
        'This delivery cannot be marked as out for delivery.',
        'Close',
        {
          duration: 3000
        }
      );

      return;
    }

    this.deliveryService
      .markOutForDelivery(
        delivery.id
      )
      .subscribe({

        next: (updatedDelivery) => {

          this.replaceDelivery(
            updatedDelivery
          );

          this.snackBar.open(
            'Delivery is now out for delivery.',
            'Close',
            {
              duration: 3000
            }
          );

          this.calculateSummary();
        },

        error: (error) => {

          console.error(
            'Out-for-delivery error:',
            error
          );

          this.snackBar.open(
            error?.message ||
            'Unable to update delivery status.',
            'Close',
            {
              duration: 4000
            }
          );
        }

      });
  }

  // ====================================================
  // COMPLETE DELIVERY
  // ====================================================

  completeDelivery(
    delivery: Delivery
  ): void {

    if (!delivery.id) {
      return;
    }

    if (
      !this.deliveryService
        .canCompleteDelivery(
          delivery
        )
    ) {

      this.snackBar.open(
        'Only out-for-delivery deliveries can be completed.',
        'Close',
        {
          duration: 3000
        }
      );

      return;
    }

    this.deliveryService
      .completeDelivery(
        delivery.id
      )
      .subscribe({

        next: (updatedDelivery) => {

          this.replaceDelivery(
            updatedDelivery
          );

          this.snackBar.open(
            'Delivery completed successfully.',
            'Close',
            {
              duration: 3000
            }
          );

          this.calculateSummary();
        },

        error: (error) => {

          console.error(
            'Complete delivery error:',
            error
          );

          this.snackBar.open(
            error?.message ||
            'Unable to complete delivery.',
            'Close',
            {
              duration: 4000
            }
          );
        }

      });
  }

  // ====================================================
  // FAIL DELIVERY
  // ====================================================

  failDelivery(
    delivery: Delivery
  ): void {

    if (!delivery.id) {
      return;
    }

    if (
      !this.deliveryService
        .canFailDelivery(
          delivery
        )
    ) {

      this.snackBar.open(
        'This delivery cannot be marked as failed.',
        'Close',
        {
          duration: 3000
        }
      );

      return;
    }

    const reason =
      window.prompt(
        'Enter the reason for failed delivery:'
      );

    if (
      reason === null ||
      !reason.trim()
    ) {
      return;
    }

    this.deliveryService
      .failDelivery(
        delivery.id,
        reason.trim()
      )
      .subscribe({

        next: (updatedDelivery) => {

          this.replaceDelivery(
            updatedDelivery
          );

          this.snackBar.open(
            'Delivery marked as failed.',
            'Close',
            {
              duration: 3000
            }
          );

          this.calculateSummary();
        },

        error: (error) => {

          console.error(
            'Failed delivery error:',
            error
          );

          this.snackBar.open(
            error?.message ||
            'Unable to mark delivery as failed.',
            'Close',
            {
              duration: 4000
            }
          );
        }

      });
  }

  // ====================================================
  // PROOF OF DELIVERY
  // ====================================================

  openProofOfDelivery(
    delivery: Delivery
  ): void {

    if (!delivery.id) {
      return;
    }

    if (
      !this.deliveryService
        .canAddProofOfDelivery(
          delivery
        )
    ) {

      this.snackBar.open(
        'Proof of delivery can only be added while the delivery is out for delivery.',
        'Close',
        {
          duration: 3500
        }
      );

      return;
    }

    this.router.navigate([
      '/deliveries',
      delivery.id,
      'proof-of-delivery'
    ]);
  }

  // ====================================================
  // STATUS LABEL
  // ====================================================

  getStatusLabel(
    status: DeliveryStatus
  ): string {

    return this.deliveryService
      .getStatusLabel(status);
  }

  // ====================================================
  // STATUS CLASS
  // ====================================================

  getStatusClass(
    status: DeliveryStatus
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
        return '';
    }
  }

  // ====================================================
  // FORMAT DATE
  // ====================================================

  formatDate(
    value?: string
  ): string {

    if (!value) {
      return '-';
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return value;
    }

    return date.toLocaleString();
  }

  // ====================================================
  // REPLACE DELIVERY
  // ====================================================

  private replaceDelivery(
    updatedDelivery: Delivery
  ): void {

    if (!updatedDelivery.id) {
      return;
    }

    const index =
      this.deliveries.findIndex(
        delivery =>
          delivery.id ===
          updatedDelivery.id
      );

    if (index === -1) {

      this.deliveries.push(
        updatedDelivery
      );

      return;
    }

    this.deliveries[index] =
      updatedDelivery;

    /*
     * Create a new array reference so
     * Angular updates the Material table.
     */
    this.deliveries = [
      ...this.deliveries
    ];
  }

  // ====================================================
  // TRACK BY
  // ====================================================

  trackByDeliveryId(
    index: number,
    delivery: Delivery
  ): number {

    return delivery.id ?? index;
  }

  // ====================================================
  // REFRESH
  // ====================================================

  refresh(): void {
    this.loadDeliveries();
  }
}