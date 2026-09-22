import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  Schedule,
  ScheduleStatus
} from '../../../core/models/module3.models';

import { ScheduleService } from '../../../core/services/schedule.service';

interface CalendarDay {
  date: Date;
  dateKey: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  schedules: Schedule[];
}

@Component({
  selector: 'app-schedule-calendar',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './schedule-calender.html',
  styleUrls: ['./schedule-calender.css']
})
export class ScheduleCalendarComponent implements OnInit {
  private readonly scheduleService = inject(ScheduleService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  schedules: Schedule[] = [];

  calendarDays: CalendarDay[] = [];

  loading = false;
  errorMessage = '';

  currentDate = new Date();

  readonly weekDays = [
    'Sun',
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat'
  ];

  ngOnInit(): void {
    this.buildCalendar();
    this.loadSchedules();
  }

  loadSchedules(): void {
    this.loading = true;
    this.errorMessage = '';

    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDate = this.formatDateKey(firstDay);
    const endDate = this.formatDateKey(lastDay);

    this.scheduleService.getSchedules().subscribe({
      next: (schedules) => {
        this.schedules = schedules.filter((schedule) =>
          this.isScheduleInCalendarMonth(
            schedule,
            startDate,
            endDate
          )
        );

        this.buildCalendar();
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;

        this.errorMessage =
          error?.message || 'Unable to load schedules.';

        this.snackBar.open(
          this.errorMessage,
          'Close',
          {
            duration: 4000
          }
        );

        this.buildCalendar();
      }
    });
  }

  buildCalendar(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);

    const startOffset = firstDayOfMonth.getDay();

    const calendarStart = new Date(
      year,
      month,
      1 - startOffset
    );

    const days: CalendarDay[] = [];

    for (let i = 0; i < 42; i++) {
      const date = new Date(calendarStart);
      date.setDate(calendarStart.getDate() + i);

      const dateKey = this.formatDateKey(date);

      days.push({
        date,
        dateKey,
        dayNumber: date.getDate(),
        isCurrentMonth: date.getMonth() === month,
        isToday: this.isToday(date),
        schedules: this.getSchedulesForDate(dateKey)
      });
    }

    this.calendarDays = days;
  }

  getSchedulesForDate(dateKey: string): Schedule[] {
    return this.schedules.filter((schedule) => {
      const startDate = this.getDateKey(schedule.startTime);
      const endDate = this.getDateKey(schedule.endTime);

      return (
        dateKey >= startDate &&
        dateKey <= endDate
      );
    });
  }

  isScheduleInCalendarMonth(
    schedule: Schedule,
    startDate: string,
    endDate: string
  ): boolean {
    const scheduleStart = this.getDateKey(schedule.startTime);
    const scheduleEnd = this.getDateKey(schedule.endTime);

    return (
      scheduleStart <= endDate &&
      scheduleEnd >= startDate
    );
  }

  previousMonth(): void {
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() - 1,
      1
    );

    this.buildCalendar();
    this.loadSchedules();
  }

  nextMonth(): void {
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() + 1,
      1
    );

    this.buildCalendar();
    this.loadSchedules();
  }

  goToToday(): void {
    this.currentDate = new Date();

    this.buildCalendar();
    this.loadSchedules();
  }

  getMonthYearLabel(): string {
    return this.currentDate.toLocaleDateString(
      undefined,
      {
        month: 'long',
        year: 'numeric'
      }
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

  createSchedule(): void {
    this.router.navigate([
      '/schedules/create'
    ]);
  }

  goToScheduleList(): void {
    this.router.navigate([
      '/schedules'
    ]);
  }

  getTypeClass(schedule: Schedule): string {
    return schedule.type === 'Pickup'
      ? 'pickup'
      : 'delivery';
  }

  getStatusClass(
    status: ScheduleStatus
  ): string {
    switch (status) {
      case 'Scheduled':
        return 'scheduled';

      case 'Rescheduled':
        return 'rescheduled';

      case 'Cancelled':
        return 'cancelled';

      case 'Completed':
        return 'completed';

      default:
        return '';
    }
  }

  getScheduleTime(
    schedule: Schedule
  ): string {
    if (!schedule.startTime) {
      return '';
    }

    const start = new Date(
      schedule.startTime
    );

    const end = schedule.endTime
      ? new Date(schedule.endTime)
      : null;

    const startText =
      start.toLocaleTimeString(
        undefined,
        {
          hour: '2-digit',
          minute: '2-digit'
        }
      );

    if (!end || Number.isNaN(end.getTime())) {
      return startText;
    }

    const endText =
      end.toLocaleTimeString(
        undefined,
        {
          hour: '2-digit',
          minute: '2-digit'
        }
      );

    return `${startText} - ${endText}`;
  }

  getScheduleTitle(
    schedule: Schedule
  ): string {
    const type = schedule.type;

    const id = schedule.id
      ? `#${schedule.id}`
      : '';

    return `${type} ${id}`;
  }

  getScheduleTooltip(
    schedule: Schedule
  ): string {
    return [
      `${schedule.type} Schedule`,
      `Schedule: #${schedule.id ?? '—'}`,
      `Driver: ${schedule.driverId}`,
      `Vehicle: ${schedule.vehicleId}`,
      `Route: ${schedule.routeId ?? '—'}`,
      `Time: ${this.getScheduleTime(schedule)}`,
      `Status: ${schedule.status}`
    ].join('\n');
  }

  formatDateKey(date: Date): string {
    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, '0');

    const day = String(
      date.getDate()
    ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  getDateKey(value: string): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value.substring(0, 10);
    }

    return this.formatDateKey(date);
  }

  isToday(date: Date): boolean {
    const today = new Date();

    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  }

  trackDay(
    index: number,
    day: CalendarDay
  ): string {
    return day.dateKey;
  }

  trackSchedule(
    index: number,
    schedule: Schedule
  ): number | string {
    return schedule.id ?? index;
  }
}