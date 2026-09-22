import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse
} from '@angular/common/http';

import { Observable, catchError, throwError } from 'rxjs';

import {Schedule,ScheduleStatus,ScheduleType,CreateScheduleRequest,UpdateScheduleRequest,RescheduleRequest,CancelScheduleRequest,ValidationResult,ScheduleSummary} from '../models/module3.models';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  /*
   * Backend API base URL.
   *
   * Assumed endpoint:
   * https://localhost:7080/api/schedules
   *
   * If your backend uses a different port/path,
   * change only this value.
   */
  private readonly apiUrl =
    'https://localhost:7080/api/schedules';

  constructor(
    private readonly http: HttpClient
  ) {}

  // ============================================================
  // GET ALL SCHEDULES
  // ============================================================

  getSchedules(): Observable<Schedule[]> {
    return this.http
      .get<Schedule[]>(this.apiUrl)
      .pipe(
        catchError(error => this.handleError(error))
      );
  }

  // ============================================================
  // GET SCHEDULE BY ID
  // ============================================================

  getScheduleById(id: number): Observable<Schedule> {
    return this.http
      .get<Schedule>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => this.handleError(error))
      );
  }

  // ============================================================
  // CREATE SCHEDULE
  // ============================================================

  createSchedule(
    request: CreateScheduleRequest
  ): Observable<Schedule> {

    return this.http
      .post<Schedule>(
        this.apiUrl,
        request
      )
      .pipe(
        catchError(error => this.handleError(error))
      );
  }

  // ============================================================
  // UPDATE SCHEDULE
  // ============================================================

  updateSchedule(
    id: number,
    request: UpdateScheduleRequest
  ): Observable<Schedule> {

    return this.http
      .put<Schedule>(
        `${this.apiUrl}/${id}`,
        request
      )
      .pipe(
        catchError(error => this.handleError(error))
      );
  }

  // ============================================================
  // DELETE SCHEDULE
  // ============================================================

  deleteSchedule(id: number): Observable<void> {
    return this.http
      .delete<void>(
        `${this.apiUrl}/${id}`
      )
      .pipe(
        catchError(error => this.handleError(error))
      );
  }

  // ============================================================
  // RESCHEDULE
  // ============================================================

  rescheduleSchedule(
    id: number,
    request: RescheduleRequest
  ): Observable<Schedule> {

    return this.http
      .post<Schedule>(
        `${this.apiUrl}/${id}/reschedule`,
        request
      )
      .pipe(
        catchError(error => this.handleError(error))
      );
  }

  // ============================================================
  // CANCEL SCHEDULE
  // ============================================================

  cancelSchedule(
    id: number,
    request: CancelScheduleRequest = {}
  ): Observable<Schedule> {

    return this.http
      .post<Schedule>(
        `${this.apiUrl}/${id}/cancel`,
        request
      )
      .pipe(
        catchError(error => this.handleError(error))
      );
  }

  // ============================================================
  // DRIVER SCHEDULES
  // ============================================================

  getDriverSchedules(
    driverId: number
  ): Observable<Schedule[]> {

    return this.http
      .get<Schedule[]>(
        `${this.apiUrl}/driver/${driverId}`
      )
      .pipe(
        catchError(error => this.handleError(error))
      );
  }

  // ============================================================
  // VEHICLE SCHEDULES
  // ============================================================

  getVehicleSchedules(
    vehicleId: number
  ): Observable<Schedule[]> {

    return this.http
      .get<Schedule[]>(
        `${this.apiUrl}/vehicle/${vehicleId}`
      )
      .pipe(
        catchError(error => this.handleError(error))
      );
  }

  // ============================================================
  // SCHEDULES BY DATE
  // ============================================================

  getSchedulesByDate(
    date: string
  ): Observable<Schedule[]> {

    return this.http
      .get<Schedule[]>(
        `${this.apiUrl}/date/${encodeURIComponent(date)}`
      )
      .pipe(
        catchError(error => this.handleError(error))
      );
  }

  // ============================================================
  // VALIDATE SCHEDULE
  // ============================================================

  validateSchedule(
    request: CreateScheduleRequest | UpdateScheduleRequest,
    existingSchedules: Schedule[] = [],
    excludeScheduleId?: number
  ): ValidationResult {

    const errors: string[] = [];

    // ----------------------------------------------------------
    // TYPE
    // ----------------------------------------------------------

    if (
      request.type !== 'Pickup' &&
      request.type !== 'Delivery'
    ) {
      errors.push(
        'Schedule type must be Pickup or Delivery.'
      );
    }

    // ----------------------------------------------------------
    // DRIVER
    // ----------------------------------------------------------

    if (
      !Number.isInteger(request.driverId) ||
      request.driverId <= 0
    ) {
      errors.push(
        'A valid driver is required.'
      );
    }

    // ----------------------------------------------------------
    // VEHICLE
    // ----------------------------------------------------------

    if (
      !Number.isInteger(request.vehicleId) ||
      request.vehicleId <= 0
    ) {
      errors.push(
        'A valid vehicle is required.'
      );
    }

    // ----------------------------------------------------------
    // SHIPMENT
    // ----------------------------------------------------------

    if (
      request.shipmentId !== null &&
      request.shipmentId !== undefined &&
      (
        !Number.isInteger(request.shipmentId) ||
        request.shipmentId <= 0
      )
    ) {
      errors.push(
        'Shipment ID must be greater than zero.'
      );
    }

    // ----------------------------------------------------------
    // ROUTE
    // ----------------------------------------------------------

    if (
      request.routeId !== null &&
      request.routeId !== undefined &&
      (
        !Number.isInteger(request.routeId) ||
        request.routeId <= 0
      )
    ) {
      errors.push(
        'Route ID must be greater than zero.'
      );
    }

    // ----------------------------------------------------------
    // START TIME
    // ----------------------------------------------------------

    const start = new Date(request.startTime);

    if (isNaN(start.getTime())) {
      errors.push(
        'A valid start time is required.'
      );
    }

    // ----------------------------------------------------------
    // END TIME
    // ----------------------------------------------------------

    const end = new Date(request.endTime);

    if (isNaN(end.getTime())) {
      errors.push(
        'A valid end time is required.'
      );
    }

    // ----------------------------------------------------------
    // TIME RANGE
    // ----------------------------------------------------------

    if (
      !isNaN(start.getTime()) &&
      !isNaN(end.getTime())
    ) {

      if (end <= start) {
        errors.push(
          'End time must be later than start time.'
        );
      }
    }

    // ----------------------------------------------------------
    // CONFLICT CHECK
    // ----------------------------------------------------------

    if (
      errors.length === 0 &&
      existingSchedules.length > 0
    ) {

      const conflictResult =
        this.findScheduleConflict(
          request,
          existingSchedules,
          excludeScheduleId
        );

      if (!conflictResult.valid) {

        if (conflictResult.errors) {
          errors.push(
            ...conflictResult.errors
          );
        }
      }
    }

    return {
      valid: errors.length === 0,
      message:
        errors.length === 0
          ? 'Schedule is valid.'
          : 'Schedule validation failed.',
      errors
    };
  }

  // ============================================================
  // FIND DRIVER / VEHICLE CONFLICT
  // ============================================================

  findScheduleConflict(
    request: CreateScheduleRequest | UpdateScheduleRequest,
    existingSchedules: Schedule[],
    excludeScheduleId?: number
  ): ValidationResult {

    const errors: string[] = [];

    const start = new Date(request.startTime);
    const end = new Date(request.endTime);

    if (
      isNaN(start.getTime()) ||
      isNaN(end.getTime()) ||
      end <= start
    ) {
      return {
        valid: false,
        message: 'Invalid schedule time range.',
        errors: [
          'Start time and end time must be valid, and end time must be later than start time.'
        ]
      };
    }

    const activeSchedules =
      existingSchedules.filter(schedule => {

        // Ignore the schedule being edited.
        if (
          excludeScheduleId !== undefined &&
          schedule.id === excludeScheduleId
        ) {
          return false;
        }

        // Cancelled schedules do not block resources.
        if (schedule.status === 'Cancelled') {
          return false;
        }

        return true;
      });

    for (const schedule of activeSchedules) {

      const existingStart =
        new Date(schedule.startTime);

      const existingEnd =
        new Date(schedule.endTime);

      if (
        isNaN(existingStart.getTime()) ||
        isNaN(existingEnd.getTime())
      ) {
        continue;
      }

      const overlapping =
        start < existingEnd &&
        end > existingStart;

      if (!overlapping) {
        continue;
      }

      // --------------------------------------------------------
      // DRIVER CONFLICT
      // --------------------------------------------------------

      if (
        schedule.driverId === request.driverId
      ) {
        errors.push(
          `Driver ${request.driverId} already has a schedule between ` +
          `${this.formatDateTime(existingStart)} and ` +
          `${this.formatDateTime(existingEnd)}.`
        );
      }

      // --------------------------------------------------------
      // VEHICLE CONFLICT
      // --------------------------------------------------------

      if (
        schedule.vehicleId === request.vehicleId
      ) {
        errors.push(
          `Vehicle ${request.vehicleId} already has a schedule between ` +
          `${this.formatDateTime(existingStart)} and ` +
          `${this.formatDateTime(existingEnd)}.`
        );
      }
    }

    return {
      valid: errors.length === 0,
      message:
        errors.length === 0
          ? 'No schedule conflict found.'
          : 'Schedule conflict detected.',
      errors
    };
  }

  // ============================================================
  // CHECK TIME OVERLAP
  // ============================================================

  hasTimeOverlap(
    startTime: string,
    endTime: string,
    existingStartTime: string,
    existingEndTime: string
  ): boolean {

    const start =
      new Date(startTime).getTime();

    const end =
      new Date(endTime).getTime();

    const existingStart =
      new Date(existingStartTime).getTime();

    const existingEnd =
      new Date(existingEndTime).getTime();

    if (
      Number.isNaN(start) ||
      Number.isNaN(end) ||
      Number.isNaN(existingStart) ||
      Number.isNaN(existingEnd)
    ) {
      return false;
    }

    return (
      start < existingEnd &&
      end > existingStart
    );
  }

  // ============================================================
  // CHECK DRIVER AVAILABILITY
  // ============================================================

  isDriverAvailable(
    driverId: number,
    startTime: string,
    endTime: string,
    schedules: Schedule[],
    excludeScheduleId?: number
  ): boolean {

    return !schedules.some(schedule => {

      if (schedule.driverId !== driverId) {
        return false;
      }

      if (schedule.status === 'Cancelled') {
        return false;
      }

      if (
        excludeScheduleId !== undefined &&
        schedule.id === excludeScheduleId
      ) {
        return false;
      }

      return this.hasTimeOverlap(
        startTime,
        endTime,
        schedule.startTime,
        schedule.endTime
      );
    });
  }

  // ============================================================
  // CHECK VEHICLE AVAILABILITY
  // ============================================================

  isVehicleAvailable(
    vehicleId: number,
    startTime: string,
    endTime: string,
    schedules: Schedule[],
    excludeScheduleId?: number
  ): boolean {

    return !schedules.some(schedule => {

      if (schedule.vehicleId !== vehicleId) {
        return false;
      }

      if (schedule.status === 'Cancelled') {
        return false;
      }

      if (
        excludeScheduleId !== undefined &&
        schedule.id === excludeScheduleId
      ) {
        return false;
      }

      return this.hasTimeOverlap(
        startTime,
        endTime,
        schedule.startTime,
        schedule.endTime
      );
    });
  }

  // ============================================================
  // GET SUMMARY
  // ============================================================

  getScheduleSummary(
    schedules: Schedule[]
  ): ScheduleSummary {

    return {
      total: schedules.length,

      scheduled: schedules.filter(
        schedule =>
          schedule.status === 'Scheduled'
      ).length,

      rescheduled: schedules.filter(
        schedule =>
          schedule.status === 'Rescheduled'
      ).length,

      cancelled: schedules.filter(
        schedule =>
          schedule.status === 'Cancelled'
      ).length,

      completed: schedules.filter(
        schedule =>
          schedule.status === 'Completed'
      ).length
    };
  }

  // ============================================================
  // STATUS LABEL
  // ============================================================

  getStatusLabel(
    status: ScheduleStatus
  ): string {

    switch (status) {

      case 'Scheduled':
        return 'Scheduled';

      case 'Rescheduled':
        return 'Rescheduled';

      case 'Cancelled':
        return 'Cancelled';

      case 'Completed':
        return 'Completed';

      default:
        return status;
    }
  }

  // ============================================================
  // TYPE LABEL
  // ============================================================

  getTypeLabel(
    type: ScheduleType
  ): string {

    switch (type) {

      case 'Pickup':
        return 'Pickup';

      case 'Delivery':
        return 'Delivery';

      default:
        return type;
    }
  }

  // ============================================================
  // STATUS CHECKS
  // ============================================================

  isActive(schedule: Schedule): boolean {

    return (
      schedule.status === 'Scheduled' ||
      schedule.status === 'Rescheduled'
    );
  }

  canEdit(schedule: Schedule): boolean {

    return (
      schedule.status !== 'Cancelled' &&
      schedule.status !== 'Completed'
    );
  }

  canReschedule(schedule: Schedule): boolean {

    return (
      schedule.status === 'Scheduled' ||
      schedule.status === 'Rescheduled'
    );
  }

  canCancel(schedule: Schedule): boolean {

    return (
      schedule.status === 'Scheduled' ||
      schedule.status === 'Rescheduled'
    );
  }

  // ============================================================
  // FORMAT DATE/TIME
  // ============================================================

  private formatDateTime(
    date: Date
  ): string {

    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    return date.toLocaleString();
  }

  // ============================================================
  // HTTP ERROR HANDLING
  // ============================================================

  private handleError(
    error: HttpErrorResponse
  ): Observable<never> {

    let message =
      'An unexpected error occurred.';

    if (error.status === 0) {

      message =
        'Unable to connect to the scheduling server. ' +
        'Please check that the LogiFlow backend is running.';
    }

    else if (error.status === 400) {

      message =
        error.error?.message ||
        'Invalid schedule data.';
    }

    else if (error.status === 401) {

      message =
        'You are not authorized. Please login again.';
    }

    else if (error.status === 403) {

      message =
        'You do not have permission to perform this scheduling operation.';
    }

    else if (error.status === 404) {

      message =
        'The requested schedule was not found.';
    }

    else if (error.status === 409) {

      message =
        error.error?.message ||
        'Schedule conflict detected. The driver or vehicle may already be scheduled.';
    }

    else if (error.status >= 500) {

      message =
        'A server error occurred while processing the schedule.';
    }

    return throwError(
      () => new Error(message)
    );
  }
}