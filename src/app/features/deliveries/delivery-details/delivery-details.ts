import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  Delivery,
  DeliveryStatus
} from '../../../core/models/module3.models';

import { DeliveryService } from '../../../core/services/delivery.service';

@Component({
  selector: 'app-delivery-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './delivery-details.html',
  styleUrls: ['./delivery-details.css']
})
export class DeliveryDetailComponent implements OnInit {

  delivery: Delivery | null = null;

  deliveryId = 0;

  loading = false;
  actionLoading = false;

  errorMessage = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly deliveryService: DeliveryService,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
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

  loadDelivery(): void {
    this.loading = true;
    this.errorMessage = '';

    this.deliveryService.getDeliveryById(this.deliveryId).subscribe({
      next: (delivery) => {
        this.delivery = delivery;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage =
          error?.message || 'Unable to load delivery details.';
      }
    });
  }

  confirmPickup(): void {
    if (!this.delivery) {
      return;
    }

    if (!this.deliveryService.canConfirmPickup(this.delivery)) {
      this.showMessage('Pickup confirmation is not available for this delivery.');
      return;
    }

    this.actionLoading = true;

    this.deliveryService.confirmPickup(this.delivery.id!).subscribe({
      next: (updatedDelivery) => {
        this.delivery = updatedDelivery;
        this.actionLoading = false;

        this.showMessage('Pickup confirmed successfully.');
      },
      error: (error) => {
        this.actionLoading = false;
        this.showMessage(
          error?.message || 'Failed to confirm pickup.'
        );
      }
    });
  }

  markOutForDelivery(): void {
    if (!this.delivery) {
      return;
    }

    if (!this.deliveryService.canMarkOutForDelivery(this.delivery)) {
      this.showMessage(
        'This delivery cannot be marked as out for delivery.'
      );
      return;
    }

    this.actionLoading = true;

    this.deliveryService
      .markOutForDelivery(this.delivery.id!)
      .subscribe({
        next: (updatedDelivery) => {
          this.delivery = updatedDelivery;
          this.actionLoading = false;

          this.showMessage('Delivery marked as out for delivery.');
        },
        error: (error) => {
          this.actionLoading = false;
          this.showMessage(
            error?.message || 'Failed to update delivery status.'
          );
        }
      });
  }

  completeDelivery(): void {
    if (!this.delivery) {
      return;
    }

    if (!this.deliveryService.canCompleteDelivery(this.delivery)) {
      this.showMessage(
        'Only an out-for-delivery shipment can be completed.'
      );
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to mark this delivery as completed?'
    );

    if (!confirmed) {
      return;
    }

    this.actionLoading = true;

    this.deliveryService
      .completeDelivery(this.delivery.id!)
      .subscribe({
        next: (updatedDelivery) => {
          this.delivery = updatedDelivery;
          this.actionLoading = false;

          this.showMessage('Delivery completed successfully.');
        },
        error: (error) => {
          this.actionLoading = false;
          this.showMessage(
            error?.message || 'Failed to complete delivery.'
          );
        }
      });
  }

  failDelivery(): void {
    if (!this.delivery) {
      return;
    }

    if (!this.deliveryService.canFailDelivery(this.delivery)) {
      this.showMessage(
        'This delivery cannot be marked as failed.'
      );
      return;
    }

    const reason = window.prompt(
      'Enter the reason for failed delivery:'
    );

    if (reason === null) {
      return;
    }

    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      this.showMessage('Failure reason is required.');
      return;
    }

    this.actionLoading = true;

    this.deliveryService
      .failDelivery(this.delivery.id!, trimmedReason)
      .subscribe({
        next: (updatedDelivery) => {
          this.delivery = updatedDelivery;
          this.actionLoading = false;

          this.showMessage('Delivery marked as failed.');
        },
        error: (error) => {
          this.actionLoading = false;
          this.showMessage(
            error?.message || 'Failed to update delivery.'
          );
        }
      });
  }

  openProofOfDelivery(): void {
    if (!this.delivery?.id) {
      return;
    }

    this.router.navigate([
      '/deliveries',
      this.delivery.id,
      'proof-of-delivery'
    ]);
  }

  openEdit(): void {
    if (!this.delivery?.id) {
      return;
    }

    this.router.navigate([
      '/deliveries/edit',
      this.delivery.id
    ]);
  }

  deleteDelivery(): void {
    if (!this.delivery?.id) {
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to delete this delivery?'
    );

    if (!confirmed) {
      return;
    }

    this.actionLoading = true;

    this.deliveryService
      .deleteDelivery(this.delivery.id)
      .subscribe({
        next: () => {
          this.actionLoading = false;

          this.showMessage('Delivery deleted successfully.');

          this.router.navigate(['/deliveries']);
        },
        error: (error) => {
          this.actionLoading = false;

          this.showMessage(
            error?.message || 'Failed to delete delivery.'
          );
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/deliveries']);
  }

  goToRoute(): void {
    if (!this.delivery?.routeId) {
      return;
    }

    this.router.navigate([
      '/routes',
      this.delivery.routeId
    ]);
  }

  getStatusLabel(status: DeliveryStatus | string | undefined): string {
    if (!status) {
      return 'Unknown';
    }

    return this.deliveryService.getStatusLabel(
      status as DeliveryStatus
    );
  }

  getStatusClass(status: DeliveryStatus | string | undefined): string {
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

  isPending(): boolean {
    return this.delivery?.status === 'Pending';
  }

  isPickupConfirmed(): boolean {
    return this.delivery?.status === 'PickupConfirmed';
  }

  isOutForDelivery(): boolean {
    return this.delivery?.status === 'OutForDelivery';
  }

  isCompleted(): boolean {
    return this.delivery?.status === 'Completed';
  }

  isFailed(): boolean {
    return this.delivery?.status === 'Failed';
  }

  canConfirmPickup(): boolean {
    return !!this.delivery &&
      this.deliveryService.canConfirmPickup(this.delivery);
  }

  canMarkOutForDelivery(): boolean {
    return !!this.delivery &&
      this.deliveryService.canMarkOutForDelivery(this.delivery);
  }

  canCompleteDelivery(): boolean {
    return !!this.delivery &&
      this.deliveryService.canCompleteDelivery(this.delivery);
  }

  canFailDelivery(): boolean {
    return !!this.delivery &&
      this.deliveryService.canFailDelivery(this.delivery);
  }

  canAddProofOfDelivery(): boolean {
    return !!this.delivery &&
      this.deliveryService.canAddProofOfDelivery(this.delivery);
  }

  formatDate(value: string | null | undefined): string {
    if (!value) {
      return '-';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString();
  }

  private showMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }
}