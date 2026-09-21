import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  Schedule,
  ScheduleStatus,
  ScheduleType
} from '../../../core/models/module3.models';

import { ScheduleService } from '../../../core/services/schedule.service';

@Component({
  selector: 'app-schedule-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './schedule-details.html',
  styleUrls: ['./schedule-details.css']
})
export class ScheduleDetailComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly scheduleService = inject(ScheduleService);
  private readonly snackBar = inject(MatSnackBar);

  schedule: Schedule | null = null;

  loading = false;
  deleting = false;
  cancelling = false;

  errorMessage = '';

  scheduleId = 0;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id || id <= 0) {
      this.errorMessage = 'Invalid schedule ID.';
      return;
    }

    this.scheduleId = id;
    this.loadSchedule();
  }

  loadSchedule(): void {
    this.loading = true;
    this.errorMessage = '';

    this.scheduleService.getScheduleById(this.scheduleId).subscribe({
      next: (schedule) => {
        this.schedule = schedule;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;

        this.errorMessage =
          error?.message || 'Unable to load schedule.';
      }
    });
  }

  refresh(): void {
    this.loadSchedule();
  }

  editSchedule(): void {
    if (!this.schedule?.id) {
      return;
    }

    this.router.navigate([
      '/schedules/edit',
      this.schedule.id
    ]);
  }

  rescheduleSchedule(): void {
    if (!this.schedule?.id) {
      return;
    }

    this.router.navigate([
      '/schedules/edit',
      this.schedule.id
    ]);
  }

  cancelSchedule(): void {
    if (!this.schedule?.id || this.cancelling) {
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to cancel this schedule?'
    );

    if (!confirmed) {
      return;
    }

    const reason = window.prompt(
      'Enter cancellation reason (optional):',
      ''
    );

    this.cancelling = true;

    this.scheduleService
      .cancelSchedule(this.schedule.id, {
        reason: reason?.trim() || null
      })
      .subscribe({
        next: (updatedSchedule) => {
          this.cancelling = false;

          this.schedule = updatedSchedule;

          this.snackBar.open(
            'Schedule cancelled successfully.',
            'Close',
            {
              duration: 3000
            }
          );
        },

        error: (error) => {
          this.cancelling = false;

          this.snackBar.open(
            error?.message ||
              'Unable to cancel schedule.',
            'Close',
            {
              duration: 4000
            }
          );
        }
      });
  }

  deleteSchedule(): void {
    if (!this.schedule?.id || this.deleting) {
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to permanently delete this schedule?'
    );

    if (!confirmed) {
      return;
    }

    this.deleting = true;

    this.scheduleService
      .deleteSchedule(this.schedule.id)
      .subscribe({
        next: () => {
          this.deleting = false;

          this.snackBar.open(
            'Schedule deleted successfully.',
            'Close',
            {
              duration: 3000
            }
          );

          this.router.navigate(['/schedules']);
        },

        error: (error) => {
          this.deleting = false;

          this.snackBar.open(
            error?.message ||
              'Unable to delete schedule.',
            'Close',
            {
              duration: 4000
            }
          );
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/schedules']);
  }

  /**
   * Opens the schedule calendar.
   * This fixes:
   * TS2339: Property 'openCalendar' does not exist
   */
  openCalendar(): void {
    this.router.navigate(['/schedules/calendar']);
  }

  openDriverSchedule(): void {
    if (!this.schedule?.driverId) {
      return;
    }

    this.router.navigate([
      '/schedules/driver',
      this.schedule.driverId
    ]);
  }

  openVehicleSchedule(): void {
    if (!this.schedule?.vehicleId) {
      return;
    }

    this.router.navigate([
      '/schedules/vehicle',
      this.schedule.vehicleId
    ]);
  }

  openRoute(): void {
    if (!this.schedule?.routeId) {
      return;
    }

    this.router.navigate([
      '/routes',
      this.schedule.routeId
    ]);
  }

  getTypeLabel(type: ScheduleType): string {
    return this.scheduleService.getTypeLabel(type);
  }

  getStatusLabel(status: ScheduleStatus): string {
    return this.scheduleService.getStatusLabel(status);
  }

  getTypeClass(type: ScheduleType): string {
    return type === 'Pickup'
      ? 'type-pickup'
      : 'type-delivery';
  }

  getStatusClass(status: ScheduleStatus): string {
    switch (status) {

      case 'Scheduled':
        return 'status-scheduled';

      case 'Rescheduled':
        return 'status-rescheduled';

      case 'Cancelled':
        return 'status-cancelled';

      case 'Completed':
        return 'status-completed';

      default:
        return '';
    }
  }

  formatDateTime(value?: string | null): string {
    if (!value) {
      return '—';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString();
  }

  formatDate(value?: string | null): string {
    if (!value) {
      return '—';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString();
  }

  canEdit(): boolean {
    if (!this.schedule) {
      return false;
    }

    return this.scheduleService.canEdit(
      this.schedule
    );
  }

  canReschedule(): boolean {
    if (!this.schedule) {
      return false;
    }

    return this.scheduleService.canReschedule(
      this.schedule
    );
  }

  canCancel(): boolean {
    if (!this.schedule) {
      return false;
    }

    return this.scheduleService.canCancel(
      this.schedule
    );
  }

  canDelete(): boolean {
    if (!this.schedule) {
      return false;
    }

    return this.schedule.status !== 'Completed';
  }

  getTimelineClass(
    status: ScheduleStatus
  ): string {

    if (!this.schedule) {
      return '';
    }

    if (this.schedule.status === status) {
      return 'timeline-active';
    }

    if (this.schedule.status === 'Completed') {
      return 'timeline-completed';
    }

    if (
      this.schedule.status === 'Cancelled' &&
      status === 'Cancelled'
    ) {
      return 'timeline-active';
    }

    return '';
  }
}