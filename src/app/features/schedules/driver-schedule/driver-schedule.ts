import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  Schedule,
  ScheduleStatus
} from '../../../core/models/module3.models';

import { ScheduleService } from '../../../core/services/schedule.service';

@Component({
  selector: 'app-driver-schedule',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './driver-schedule.html',
  styleUrls: ['./driver-schedule.css']
})
export class DriverScheduleComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly scheduleService = inject(ScheduleService);
  private readonly snackBar = inject(MatSnackBar);

  driverId = 0;

  schedules: Schedule[] = [];

  loading = false;
  errorMessage = '';

  selectedStatus: 'All' | ScheduleStatus = 'All';

  ngOnInit(): void {
    const id = Number(
      this.route.snapshot.paramMap.get('driverId')
    );

    if (!id || id <= 0) {
      this.errorMessage = 'Invalid driver ID.';
      return;
    }

    this.driverId = id;

    this.loadDriverSchedules();
  }

  loadDriverSchedules(): void {
    this.loading = true;
    this.errorMessage = '';

    this.scheduleService
      .getDriverSchedules(this.driverId)
      .subscribe({
        next: (schedules) => {
          this.schedules = this.sortSchedules(schedules);
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;

          this.errorMessage =
            error?.message ||
            'Unable to load driver schedules.';

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

  refresh(): void {
    this.loadDriverSchedules();
  }

  get filteredSchedules(): Schedule[] {
    if (this.selectedStatus === 'All') {
      return this.schedules;
    }

    return this.schedules.filter(
      schedule =>
        schedule.status === this.selectedStatus
    );
  }

  setStatusFilter(
    status: 'All' | ScheduleStatus
  ): void {
    this.selectedStatus = status;
  }

  get totalCount(): number {
    return this.schedules.length;
  }

  get scheduledCount(): number {
    return this.schedules.filter(
      schedule =>
        schedule.status === 'Scheduled'
    ).length;
  }

  get rescheduledCount(): number {
    return this.schedules.filter(
      schedule =>
        schedule.status === 'Rescheduled'
    ).length;
  }

  get completedCount(): number {
    return this.schedules.filter(
      schedule =>
        schedule.status === 'Completed'
    ).length;
  }

  get cancelledCount(): number {
    return this.schedules.filter(
      schedule =>
        schedule.status === 'Cancelled'
    ).length;
  }

  get pickupCount(): number {
    return this.schedules.filter(
      schedule =>
        schedule.type === 'Pickup'
    ).length;
  }

  get deliveryCount(): number {
    return this.schedules.filter(
      schedule =>
        schedule.type === 'Delivery'
    ).length;
  }

  get activeSchedules(): Schedule[] {
    return this.schedules.filter(
      schedule =>
        schedule.status !== 'Cancelled' &&
        schedule.status !== 'Completed'
    );
  }

  getConflictCount(): number {
    let count = 0;

    const active = this.activeSchedules;

    for (let i = 0; i < active.length; i++) {
      for (let j = i + 1; j < active.length; j++) {
        if (
          this.hasTimeOverlap(
            active[i],
            active[j]
          )
        ) {
          count++;
        }
      }
    }

    return count;
  }

  hasScheduleConflict(
    schedule: Schedule
  ): boolean {
    if (
      schedule.status === 'Cancelled' ||
      schedule.status === 'Completed'
    ) {
      return false;
    }

    return this.schedules.some(
      other =>
        other.id !== schedule.id &&
        other.status !== 'Cancelled' &&
        other.status !== 'Completed' &&
        this.hasTimeOverlap(
          schedule,
          other
        )
    );
  }

  hasTimeOverlap(
    first: Schedule,
    second: Schedule
  ): boolean {
    const firstStart =
      new Date(first.startTime).getTime();

    const firstEnd =
      new Date(first.endTime).getTime();

    const secondStart =
      new Date(second.startTime).getTime();

    const secondEnd =
      new Date(second.endTime).getTime();

    if (
      Number.isNaN(firstStart) ||
      Number.isNaN(firstEnd) ||
      Number.isNaN(secondStart) ||
      Number.isNaN(secondEnd)
    ) {
      return false;
    }

    return (
      firstStart < secondEnd &&
      firstEnd > secondStart
    );
  }

  openSchedule(schedule: Schedule): void {
    if (!schedule.id) {
      return;
    }

    this.router.navigate([
      '/schedules',
      schedule.id
    ]);
  }

  editSchedule(schedule: Schedule): void {
    if (!schedule.id) {
      return;
    }

    this.router.navigate([
      '/schedules/edit',
      schedule.id
    ]);
  }

  createSchedule(): void {
    this.router.navigate([
      '/schedules/create'
    ]);
  }

  openCalendar(): void {
    this.router.navigate([
      '/schedules/calendar'
    ]);
  }

  openScheduleList(): void {
    this.router.navigate([
      '/schedules'
    ]);
  }
  openDriverSchedule(driverId: number): void {
  if (!driverId) {
    return;
  }

  this.router.navigate([
    '/schedules/driver',
    driverId
  ]);
}

  getStatusClass(
    status: ScheduleStatus
  ): string {
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

  getTypeClass(
    type: 'Pickup' | 'Delivery'
  ): string {
    return type === 'Pickup'
      ? 'type-pickup'
      : 'type-delivery';
  }

  getTypeIcon(
    type: 'Pickup' | 'Delivery'
  ): string {
    return type === 'Pickup'
      ? 'inventory_2'
      : 'local_shipping';
  }

  getStatusIcon(
    status: ScheduleStatus
  ): string {
    switch (status) {
      case 'Scheduled':
        return 'event';

      case 'Rescheduled':
        return 'event_repeat';

      case 'Cancelled':
        return 'cancel';

      case 'Completed':
        return 'check_circle';

      default:
        return 'event';
    }
  }

  formatDateTime(
    value?: string | null
  ): string {
    if (!value) {
      return '—';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString();
  }

  formatDate(
    value?: string | null
  ): string {
    if (!value) {
      return '—';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString(
      undefined,
      {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }
    );
  }

  formatTime(
    value?: string | null
  ): string {
    if (!value) {
      return '—';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleTimeString(
      undefined,
      {
        hour: '2-digit',
        minute: '2-digit'
      }
    );
  }

  getDuration(schedule: Schedule): string {
    const start =
      new Date(schedule.startTime).getTime();

    const end =
      new Date(schedule.endTime).getTime();

    if (
      Number.isNaN(start) ||
      Number.isNaN(end) ||
      end <= start
    ) {
      return '—';
    }

    const minutes =
      Math.round((end - start) / 60000);

    const hours =
      Math.floor(minutes / 60);

    const remainingMinutes =
      minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }

    return `${remainingMinutes}m`;
  }

  isToday(
    value?: string | null
  ): boolean {
    if (!value) {
      return false;
    }

    const date = new Date(value);
    const today = new Date();

    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  }

  isPast(schedule: Schedule): boolean {
    if (
      schedule.status === 'Completed' ||
      schedule.status === 'Cancelled'
    ) {
      return false;
    }

    const end =
      new Date(schedule.endTime).getTime();

    return (
      !Number.isNaN(end) &&
      end < Date.now()
    );
  }

  isUpcoming(schedule: Schedule): boolean {
    if (
      schedule.status === 'Completed' ||
      schedule.status === 'Cancelled'
    ) {
      return false;
    }

    const start =
      new Date(schedule.startTime).getTime();

    return (
      !Number.isNaN(start) &&
      start > Date.now()
    );
  }

  private sortSchedules(
    schedules: Schedule[]
  ): Schedule[] {
    return [...schedules].sort(
      (a, b) =>
        new Date(a.startTime).getTime() -
        new Date(b.startTime).getTime()
    );
  }

  trackByScheduleId(
    index: number,
    schedule: Schedule
  ): number | string {
    return schedule.id ?? index;
  }
}