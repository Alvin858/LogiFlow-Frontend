import { Injectable, inject } from '@angular/core';
import {HttpClient,HttpErrorResponse} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

import {ApiError,CreateDeliveryRequest,CreateProofOfDeliveryRequest,Delivery,DeliveryFailureRequest,DeliverySummary,PickupConfirmationRequest,UpdateDeliveryRequest,ValidationResult} from '../models/module3.models';

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {

  private readonly http = inject(HttpClient);

  /*
   * Change this URL if your backend uses
   * a different HTTPS port.
   */
  private readonly apiUrl =
    'https://localhost:7080/api/deliveries';

  // ====================================================
  // GET ALL DELIVERIES
  // ====================================================

  getDeliveries(): Observable<Delivery[]> {

    return this.http
      .get<Delivery[]>(this.apiUrl)
      .pipe(
        catchError(error =>
          this.handleError(error)
        )
      );
  }

  // ====================================================
  // GET DELIVERY BY ID
  // ====================================================

  getDeliveryById(
    id: number
  ): Observable<Delivery> {

    return this.http
      .get<Delivery>(
        `${this.apiUrl}/${id}`
      )
      .pipe(
        catchError(error =>
          this.handleError(error)
        )
      );
  }

  // ====================================================
  // CREATE DELIVERY
  // ====================================================

  createDelivery(
    request: CreateDeliveryRequest
  ): Observable<Delivery> {

    return this.http
      .post<Delivery>(
        this.apiUrl,
        request
      )
      .pipe(
        catchError(error =>
          this.handleError(error)
        )
      );
  }

  // ====================================================
  // UPDATE DELIVERY
  // ====================================================

  updateDelivery(
    id: number,
    request: UpdateDeliveryRequest
  ): Observable<Delivery> {

    return this.http
      .put<Delivery>(
        `${this.apiUrl}/${id}`,
        request
      )
      .pipe(
        catchError(error =>
          this.handleError(error)
        )
      );
  }

  // ====================================================
  // DELETE DELIVERY
  // ====================================================

  deleteDelivery(
    id: number
  ): Observable<void> {

    return this.http
      .delete<void>(
        `${this.apiUrl}/${id}`
      )
      .pipe(
        catchError(error =>
          this.handleError(error)
        )
      );
  }

  // ====================================================
  // CONFIRM PICKUP
  // ====================================================

  confirmPickup(
    deliveryId: number
  ): Observable<Delivery> {

    const request:
      PickupConfirmationRequest = {
        deliveryId
      };

    return this.http
      .post<Delivery>(
        `${this.apiUrl}/${deliveryId}/pickup-confirmation`,
        request
      )
      .pipe(
        catchError(error =>
          this.handleError(error)
        )
      );
  }

  // ====================================================
  // MARK OUT FOR DELIVERY
  // ====================================================

  markOutForDelivery(
    deliveryId: number
  ): Observable<Delivery> {

    return this.http
      .post<Delivery>(
        `${this.apiUrl}/${deliveryId}/out-for-delivery`,
        {}
      )
      .pipe(
        catchError(error =>
          this.handleError(error)
        )
      );
  }

  // ====================================================
  // COMPLETE DELIVERY
  // ====================================================

  completeDelivery(
    deliveryId: number
  ): Observable<Delivery> {

    return this.http
      .post<Delivery>(
        `${this.apiUrl}/${deliveryId}/complete`,
        {}
      )
      .pipe(
        catchError(error =>
          this.handleError(error)
        )
      );
  }

  // ====================================================
  // FAIL DELIVERY
  // ====================================================

  failDelivery(
    deliveryId: number,
    reason: string
  ): Observable<Delivery> {

    const request:
      DeliveryFailureRequest = {
        deliveryId,
        reason
      };

    return this.http
      .post<Delivery>(
        `${this.apiUrl}/${deliveryId}/fail`,
        request
      )
      .pipe(
        catchError(error =>
          this.handleError(error)
        )
      );
  }

  // ====================================================
  // CREATE PROOF OF DELIVERY
  // ====================================================

  createProofOfDelivery(
    request: CreateProofOfDeliveryRequest
  ): Observable<Delivery> {

    return this.http
      .post<Delivery>(
        `${this.apiUrl}/${request.deliveryId}/proof-of-delivery`,
        request
      )
      .pipe(
        catchError(error =>
          this.handleError(error)
        )
      );
  }

  // ====================================================
  // GET PROOF OF DELIVERY
  // ====================================================

  getProofOfDelivery(
    deliveryId: number
  ): Observable<any> {

    return this.http
      .get<any>(
        `${this.apiUrl}/${deliveryId}/proof-of-delivery`
      )
      .pipe(
        catchError(error =>
          this.handleError(error)
        )
      );
  }

  // ====================================================
  // GET DELIVERY SUMMARY
  // ====================================================

  getDeliverySummary(
    deliveries: Delivery[]
  ): DeliverySummary {

    const summary: DeliverySummary = {
      total: deliveries.length,
      pending: 0,
      pickupConfirmed: 0,
      outForDelivery: 0,
      completed: 0,
      failed: 0
    };

    deliveries.forEach(delivery => {

      switch (delivery.status) {

        case 'Pending':
          summary.pending++;
          break;

        case 'PickupConfirmed':
          summary.pickupConfirmed++;
          break;

        case 'OutForDelivery':
          summary.outForDelivery++;
          break;

        case 'Completed':
          summary.completed++;
          break;

        case 'Failed':
          summary.failed++;
          break;

      }

    });

    return summary;
  }

  // ====================================================
// VALIDATE DELIVERY
// ====================================================

validateDelivery(
  request: Partial<CreateDeliveryRequest>
): ValidationResult {

  const errors: string[] = [];

  if (
    !request.shipmentId ||
    request.shipmentId <= 0
  ) {
    errors.push(
      'A valid shipment must be selected.'
    );
  }

  if (
    !request.driverId ||
    request.driverId <= 0
  ) {
    errors.push(
      'A valid driver must be selected.'
    );
  }

  if (
    !request.vehicleId ||
    request.vehicleId <= 0
  ) {
    errors.push(
      'A valid vehicle must be selected.'
    );
  }

  if (
    !request.routeId ||
    request.routeId <= 0
  ) {
    errors.push(
      'A valid route must be selected.'
    );
  }

  if (errors.length > 0) {
    return {
      valid: false,
      message: errors.join(' '),
      errors
    };
  }

  return {
    valid: true,
    message: 'Delivery information is valid.',
    errors: []
  };
}
  // ====================================================
  // CHECK WHETHER DELIVERY CAN BE PICKED UP
  // ====================================================

  canConfirmPickup(
    delivery: Delivery
  ): boolean {

    return delivery.status === 'Pending';
  }

  // ====================================================
  // CHECK WHETHER DELIVERY CAN GO OUT FOR DELIVERY
  // ====================================================

  canMarkOutForDelivery(
    delivery: Delivery
  ): boolean {

    return (
      delivery.status ===
      'PickupConfirmed'
    );
  }

  // ====================================================
  // CHECK WHETHER DELIVERY CAN BE COMPLETED
  // ====================================================

  canCompleteDelivery(
    delivery: Delivery
  ): boolean {

    return (
      delivery.status ===
      'OutForDelivery'
    );
  }

  // ====================================================
  // CHECK WHETHER DELIVERY CAN BE FAILED
  // ====================================================

  canFailDelivery(
    delivery: Delivery
  ): boolean {

    return (
      delivery.status !== 'Completed' &&
      delivery.status !== 'Failed'
    );
  }

  // ====================================================
  // CHECK WHETHER PROOF OF DELIVERY CAN BE ADDED
  // ====================================================

  canAddProofOfDelivery(
    delivery: Delivery
  ): boolean {

    return (
      delivery.status ===
      'OutForDelivery'
    );
  }

  // ====================================================
  // STATUS DISPLAY
  // ====================================================

  getStatusLabel(
    status: Delivery['status']
  ): string {

    switch (status) {

      case 'Pending':
        return 'Pending';

      case 'PickupConfirmed':
        return 'Pickup Confirmed';

      case 'OutForDelivery':
        return 'Out for Delivery';

      case 'Completed':
        return 'Completed';

      case 'Failed':
        return 'Failed';

      default:
        return status;
    }
  }

  // ====================================================
  // ERROR HANDLING
  // ====================================================

  private handleError(
    error: HttpErrorResponse
  ): Observable<never> {

    let message =
      'An unexpected error occurred.';

    if (error.status === 0) {

      message =
        'Unable to connect to the backend server. ' +
        'Make sure the LogiFlow API is running.';

    } else if (error.status === 400) {

      message =
        this.extractApiError(
          error,
          'Invalid delivery request.'
        );

    } else if (error.status === 401) {

      message =
        'You are not authorized. Please login again.';

    } else if (error.status === 403) {

      message =
        'You do not have permission to perform this action.';

    } else if (error.status === 404) {

      message =
        'The requested delivery was not found.';

    } else if (error.status === 409) {

      message =
        this.extractApiError(
          error,
          'The delivery conflicts with another active delivery or resource.'
        );

    } else if (error.status >= 500) {

      message =
        'A server error occurred. Please try again later.';

    } else {

      message =
        this.extractApiError(
          error,
          message
        );
    }

    return throwError(() => ({
      status: error.status,
      message,
      originalError: error
    }));
  }

  // ====================================================
  // EXTRACT BACKEND ERROR
  // ====================================================

  private extractApiError(
    error: HttpErrorResponse,
    fallback: string
  ): string {

    const body = error.error as
      | ApiError
      | string
      | null
      | undefined;

    if (!body) {
      return fallback;
    }

    if (typeof body === 'string') {
      return body;
    }

    if (
      body.message &&
      body.message.trim()
    ) {
      return body.message;
    }

    if (body.errors) {

      const messages: string[] = [];

      Object.values(
        body.errors
      ).forEach(errors => {

        if (Array.isArray(errors)) {
          messages.push(
            ...errors
          );
        }

      });

      if (messages.length > 0) {
        return messages.join(' ');
      }
    }

    return fallback;
  }
}