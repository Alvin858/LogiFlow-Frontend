import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  Schedule,
  ScheduleSummary
} from '../../../core/models/module3.models';

import { ScheduleService } from '../../../core/services/schedule.service';

@Component({
  selector: 'app-schedule-list',
  standalone: true,

  imports: [
    CommonModule,
    RouterModule,

    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatDialogModule,
    MatTooltipModule
  ],

  // YOUR ACTUAL FILE NAMES
  templateUrl: './schedule-list.html',
  styleUrls: ['./schedule-list.css']
})
export class ScheduleListComponent implements OnInit {

  schedules: Schedule[] = [];

  summary: ScheduleSummary = {
    total: 0,
    scheduled: 0,
    rescheduled: 0,
    cancelled: 0,
    completed: 0
  };

  displayedColumns: string[] = [
    'id',
    'type',
    'shipmentId',
    'routeId',
    'driverId',
    'vehicleId',
    'startTime',
    'endTime',
    'status',
    'actions'
  ];

  loading = false;
  errorMessage = '';

  constructor(
    private readonly scheduleService: ScheduleService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadSchedules();
  }

  loadSchedules(): void {
    this.loading = true;
    this.errorMessage = '';

    this.scheduleService.getSchedules().subscribe({
      next: (data) => {
        this.schedules = data ?? [];

        this.summary =
          this.scheduleService.getScheduleSummary(
            this.schedules
          );

        this.loading = false;
      },

      error: (error: Error) => {
        this.loading = false;

        this.errorMessage =
          error.message ||
          'Unable to load schedules.';
      }
    });
  }

  createSchedule(): void {
    this.router.navigate(['/schedules/create']);
  }

  viewSchedule(schedule: Schedule): void {
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

  rescheduleSchedule(schedule: Schedule): void {
    if (!schedule.id) {
      return;
    }

    this.router.navigate([
      '/schedules/edit',
      schedule.id
    ]);
  }

  cancelSchedule(schedule: Schedule): void {
    if (!schedule.id) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to cancel schedule #${schedule.id}?`
    );

    if (!confirmed) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.scheduleService
      .cancelSchedule(schedule.id)
      .subscribe({
        next: () => {
          this.loadSchedules();
        },

        error: (error: Error) => {
          this.loading = false;

          this.errorMessage =
            error.message ||
            'Unable to cancel schedule.';
        }
      });
  }

  deleteSchedule(schedule: Schedule): void {
    if (!schedule.id) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete schedule #${schedule.id}?`
    );

    if (!confirmed) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.scheduleService
      .deleteSchedule(schedule.id)
      .subscribe({
        next: () => {
          this.loadSchedules();
        },

        error: (error: Error) => {
          this.loading = false;

          this.errorMessage =
            error.message ||
            'Unable to delete schedule.';
        }
      });
  }

  viewDriverSchedule(driverId: number): void {
    this.router.navigate([
      '/schedules/driver',
      driverId
    ]);
  }

  openCalendar(): void {
    this.router.navigate([
      '/schedules/calendar'
    ]);
  }

  getStatusLabel(schedule: Schedule): string {
    return this.scheduleService.getStatusLabel(
      schedule.status
    );
  }

  getTypeLabel(schedule: Schedule): string {
    return this.scheduleService.getTypeLabel(
      schedule.type
    );
  }

  getStatusClass(
    status: Schedule['status']
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
    type: Schedule['type']
  ): string {

    switch (type) {
      case 'Pickup':
        return 'type-pickup';

      case 'Delivery':
        return 'type-delivery';

      default:
        return '';
    }
  }

  canEdit(schedule: Schedule): boolean {
    return this.scheduleService.canEdit(schedule);
  }

  canReschedule(schedule: Schedule): boolean {
    return this.scheduleService.canReschedule(schedule);
  }

  canCancel(schedule: Schedule): boolean {
    return this.scheduleService.canCancel(schedule);
  }

  formatDate(date: string | undefined): string {
    if (!date) {
      return '-';
    }

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
      return '-';
    }

    return parsedDate.toLocaleDateString();
  }

  formatTime(date: string | undefined): string {
    if (!date) {
      return '-';
    }

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
      return '-';
    }

    return parsedDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDateTime(date: string | undefined): string {
    if (!date) {
      return '-';
    }

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
      return '-';
    }

    return parsedDate.toLocaleString();
  }

  refresh(): void {
    this.loadSchedules();
  }
}