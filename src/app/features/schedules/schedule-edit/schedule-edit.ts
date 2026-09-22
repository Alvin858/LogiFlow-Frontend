import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  ActivatedRoute,
  Router,
  RouterModule
} from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

import {
  Schedule,
  ScheduleStatus,
  ScheduleType,
  UpdateScheduleRequest
} from '../../../core/models/module3.models';

import { ScheduleService } from '../../../core/services/schedule.service';

@Component({
  selector: 'app-schedule-edit',
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule
  ],

  templateUrl: './schedule-edit.html',
  styleUrls: ['./schedule-edit.css']
})
export class ScheduleEditComponent implements OnInit {

  scheduleForm!: FormGroup;

  scheduleId!: number;

  schedule: Schedule | null = null;

  existingSchedules: Schedule[] = [];

  scheduleTypes: ScheduleType[] = [
    'Pickup',
    'Delivery'
  ];

  scheduleStatuses: ScheduleStatus[] = [
    'Scheduled',
    'Rescheduled',
    'Cancelled',
    'Completed'
  ];

  loading = false;
  loadingSchedule = true;

  errorMessage = '';
  successMessage = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly scheduleService: ScheduleService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {

    this.initializeForm();

    const idParam =
      this.route.snapshot.paramMap.get('id');

    const id =
      Number(idParam);

    if (
      !idParam ||
      !Number.isInteger(id) ||
      id <= 0
    ) {
      this.errorMessage =
        'Invalid schedule ID.';

      this.loadingSchedule = false;
      return;
    }

    this.scheduleId = id;

    this.loadSchedule();
  }

  // ============================================================
  // INITIALIZE FORM
  // ============================================================

  private initializeForm(): void {

    this.scheduleForm = this.fb.group({

      type: [
        'Pickup',
        Validators.required
      ],

      shipmentId: [
        null,
        Validators.min(1)
      ],

      routeId: [
        null,
        Validators.min(1)
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

      startTime: [
        '',
        Validators.required
      ],

      endTime: [
        '',
        Validators.required
      ],

      status: [
        'Scheduled',
        Validators.required
      ],

      notes: [
        '',
        Validators.maxLength(1000)
      ]

    });
  }

  // ============================================================
  // LOAD SCHEDULE
  // ============================================================

  private loadSchedule(): void {

    this.loadingSchedule = true;
    this.errorMessage = '';

    this.scheduleService
      .getScheduleById(this.scheduleId)
      .subscribe({

        next: (schedule) => {

          this.schedule = schedule;

          this.patchForm(schedule);

          this.loadExistingSchedules();
        },

        error: (error: Error) => {

          this.loadingSchedule = false;

          this.errorMessage =
            error.message ||
            'Unable to load schedule.';
        }
      });
  }

  // ============================================================
  // LOAD EXISTING SCHEDULES
  // ============================================================

  private loadExistingSchedules(): void {

    this.scheduleService
      .getSchedules()
      .subscribe({

        next: (schedules) => {

          this.existingSchedules =
            schedules ?? [];

          this.loadingSchedule = false;
        },

        error: () => {

          this.existingSchedules = [];

          this.loadingSchedule = false;
        }
      });
  }

  // ============================================================
  // PATCH FORM
  // ============================================================

  private patchForm(
    schedule: Schedule
  ): void {

    this.scheduleForm.patchValue({

      type: schedule.type,

      shipmentId:
        schedule.shipmentId ?? null,

      routeId:
        schedule.routeId ?? null,

      driverId:
        schedule.driverId,

      vehicleId:
        schedule.vehicleId,

      startTime:
        this.toDateTimeLocal(
          schedule.startTime
        ),

      endTime:
        this.toDateTimeLocal(
          schedule.endTime
        ),

      status:
        schedule.status,

      notes:
        schedule.notes ?? ''
    });
  }

  // ============================================================
  // SUBMIT
  // ============================================================

  submit(): void {

    this.errorMessage = '';
    this.successMessage = '';

    if (!this.schedule) {

      this.errorMessage =
        'Schedule data is not available.';

      return;
    }

    if (this.scheduleForm.invalid) {

      this.scheduleForm.markAllAsTouched();

      this.errorMessage =
        'Please correct the highlighted fields.';

      return;
    }

    const request =
      this.buildRequest();

    const validation =
      this.scheduleService.validateSchedule(
        request,
        this.existingSchedules,
        this.scheduleId
      );

    if (!validation.valid) {

      this.errorMessage =
        validation.errors?.join(' ') ||
        'Schedule validation failed.';

      return;
    }

    this.loading = true;

    this.scheduleService
      .updateSchedule(
        this.scheduleId,
        request
      )
      .subscribe({

        next: (updatedSchedule) => {

          this.loading = false;

          this.successMessage =
            'Schedule updated successfully.';

          this.schedule =
            updatedSchedule;

          setTimeout(() => {

            this.router.navigate([
              '/schedules',
              this.scheduleId
            ]);

          }, 500);
        },

        error: (error: Error) => {

          this.loading = false;

          this.errorMessage =
            error.message ||
            'Unable to update schedule.';
        }
      });
  }

  // ============================================================
  // BUILD REQUEST
  // ============================================================

  private buildRequest(): UpdateScheduleRequest {

    const value =
      this.scheduleForm.getRawValue();

    return {

      type: value.type,

      shipmentId:
        this.toNullableNumber(
          value.shipmentId
        ),

      routeId:
        this.toNullableNumber(
          value.routeId
        ),

      driverId:
        Number(value.driverId),

      vehicleId:
        Number(value.vehicleId),

      startTime:
        this.normalizeDateTime(
          value.startTime
        ),

      endTime:
        this.normalizeDateTime(
          value.endTime
        ),

      notes:
        value.notes?.trim() || null,

      status:
        value.status
    };
  }

  // ============================================================
  // NUMBER CONVERSION
  // ============================================================

  private toNullableNumber(
    value: unknown
  ): number | null {

    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return null;
    }

    const numberValue =
      Number(value);

    return Number.isFinite(numberValue)
      ? numberValue
      : null;
  }

  // ============================================================
  // DATETIME LOCAL -> ISO
  // ============================================================

  private normalizeDateTime(
    value: string
  ): string {

    if (!value) {
      return '';
    }

    const date =
      new Date(value);

    if (isNaN(date.getTime())) {
      return value;
    }

    return date.toISOString();
  }

  // ============================================================
  // ISO -> DATETIME LOCAL
  // ============================================================

  private toDateTimeLocal(
    value: string
  ): string {

    if (!value) {
      return '';
    }

    const date =
      new Date(value);

    if (isNaN(date.getTime())) {
      return '';
    }

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, '0');

    const day =
      String(
        date.getDate()
      ).padStart(2, '0');

    const hours =
      String(
        date.getHours()
      ).padStart(2, '0');

    const minutes =
      String(
        date.getMinutes()
      ).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  // ============================================================
  // CANCEL
  // ============================================================

  cancel(): void {

    this.router.navigate([
      '/schedules',
      this.scheduleId
    ]);
  }

  // ============================================================
  // BACK TO LIST
  // ============================================================

  backToList(): void {

    this.router.navigate([
      '/schedules'
    ]);
  }

  // ============================================================
  // RESET TO ORIGINAL VALUES
  // ============================================================

  reset(): void {

    if (!this.schedule) {
      return;
    }

    this.patchForm(
      this.schedule
    );

    this.errorMessage = '';
    this.successMessage = '';
  }

  // ============================================================
  // FIELD VALIDATION
  // ============================================================

  isInvalid(
    fieldName: string
  ): boolean {

    const control =
      this.scheduleForm.get(
        fieldName
      );

    return !!(
      control &&
      control.invalid &&
      (control.touched || control.dirty)
    );
  }

  // ============================================================
  // FIELD ERROR
  // ============================================================

  getFieldError(
    fieldName: string
  ): string {

    const control =
      this.scheduleForm.get(
        fieldName
      );

    if (
      !control ||
      !control.errors
    ) {
      return '';
    }

    if (
      control.errors['required']
    ) {
      return 'This field is required.';
    }

    if (
      control.errors['min']
    ) {
      return 'Value must be greater than zero.';
    }

    if (
      control.errors['maxlength']
    ) {
      return 'Maximum 1000 characters allowed.';
    }

    return 'Invalid value.';
  }

  // ============================================================
  // MINIMUM END TIME
  // ============================================================

  getMinimumEndTime(): string {

    return (
      this.scheduleForm.get(
        'startTime'
      )?.value || ''
    );
  }

  // ============================================================
  // DRIVER CONFLICT
  // ============================================================

  hasDriverConflict(): boolean {

    const driverId =
      Number(
        this.scheduleForm.get(
          'driverId'
        )?.value
      );

    const startTime =
      this.scheduleForm.get(
        'startTime'
      )?.value;

    const endTime =
      this.scheduleForm.get(
        'endTime'
      )?.value;

    if (
      !driverId ||
      !startTime ||
      !endTime
    ) {
      return false;
    }

    return !this.scheduleService.isDriverAvailable(
      driverId,
      this.normalizeDateTime(startTime),
      this.normalizeDateTime(endTime),
      this.existingSchedules,
      this.scheduleId
    );
  }

  // ============================================================
  // VEHICLE CONFLICT
  // ============================================================

  hasVehicleConflict(): boolean {

    const vehicleId =
      Number(
        this.scheduleForm.get(
          'vehicleId'
        )?.value
      );

    const startTime =
      this.scheduleForm.get(
        'startTime'
      )?.value;

    const endTime =
      this.scheduleForm.get(
        'endTime'
      )?.value;

    if (
      !vehicleId ||
      !startTime ||
      !endTime
    ) {
      return false;
    }

    return !this.scheduleService.isVehicleAvailable(
      vehicleId,
      this.normalizeDateTime(startTime),
      this.normalizeDateTime(endTime),
      this.existingSchedules,
      this.scheduleId
    );
  }
}