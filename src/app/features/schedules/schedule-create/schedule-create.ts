import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

import {
  CreateScheduleRequest,
  Schedule,
  ScheduleType
} from '../../../core/models/module3.models';

import { ScheduleService } from '../../../core/services/schedule.service';

@Component({
  selector: 'app-schedule-create',
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

  templateUrl: './schedule-create.html',
  styleUrls: ['./schedule-create.css']
})
export class ScheduleCreateComponent implements OnInit {

  scheduleForm!: FormGroup;

  loading = false;
  errorMessage = '';
  successMessage = '';

  scheduleTypes: ScheduleType[] = [
    'Pickup',
    'Delivery'
  ];

  existingSchedules: Schedule[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly scheduleService: ScheduleService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {

    this.initializeForm();

    this.loadExistingSchedules();
  }

  // ============================================================
  // FORM
  // ============================================================

  private initializeForm(): void {

    this.scheduleForm = this.fb.group({

      type: [
        'Pickup',
        Validators.required
      ],

      shipmentId: [
        null,
        [
          Validators.min(1)
        ]
      ],

      routeId: [
        null,
        [
          Validators.min(1)
        ]
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

      notes: [
        '',
        [
          Validators.maxLength(1000)
        ]
      ]

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
        },

        error: () => {

          /*
           * Schedule creation can still continue.
           * Backend validation remains authoritative.
           */
          this.existingSchedules = [];
        }
      });
  }

  // ============================================================
  // SUBMIT
  // ============================================================

  submit(): void {

    this.errorMessage = '';
    this.successMessage = '';

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
        this.existingSchedules
      );

    if (!validation.valid) {

      this.errorMessage =
        validation.errors?.join(' ') ||
        'Schedule validation failed.';

      return;
    }

    this.loading = true;

    this.scheduleService
      .createSchedule(request)
      .subscribe({

        next: (schedule) => {

          this.loading = false;

          this.successMessage =
            'Schedule created successfully.';

          if (schedule?.id) {

            this.router.navigate([
              '/schedules',
              schedule.id
            ]);

          } else {

            this.router.navigate([
              '/schedules'
            ]);
          }
        },

        error: (error: Error) => {

          this.loading = false;

          this.errorMessage =
            error.message ||
            'Unable to create schedule.';
        }
      });
  }

  // ============================================================
  // BUILD REQUEST
  // ============================================================

  private buildRequest(): CreateScheduleRequest {

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
        value.notes?.trim() || null
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
  // DATE/TIME NORMALIZATION
  // ============================================================

  private normalizeDateTime(
    value: string
  ): string {

    if (!value) {
      return '';
    }

    /*
     * datetime-local returns:
     * YYYY-MM-DDTHH:mm
     *
     * JavaScript Date converts it to the
     * browser's local timezone.
     */
    const date = new Date(value);

    if (isNaN(date.getTime())) {
      return value;
    }

    return date.toISOString();
  }

  // ============================================================
  // CANCEL
  // ============================================================

  cancel(): void {

    this.router.navigate([
      '/schedules'
    ]);
  }

  // ============================================================
  // RESET
  // ============================================================

  reset(): void {

    this.scheduleForm.reset({
      type: 'Pickup',
      shipmentId: null,
      routeId: null,
      driverId: null,
      vehicleId: null,
      startTime: '',
      endTime: '',
      notes: ''
    });

    this.errorMessage = '';
    this.successMessage = '';
  }

  // ============================================================
  // FIELD HELPERS
  // ============================================================

  isInvalid(
    fieldName: string
  ): boolean {

    const control =
      this.scheduleForm.get(fieldName);

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
      this.scheduleForm.get(fieldName);

    if (!control || !control.errors) {
      return '';
    }

    if (control.errors['required']) {
      return 'This field is required.';
    }

    if (control.errors['min']) {
      return 'Value must be greater than zero.';
    }

    if (control.errors['maxlength']) {
      return 'Maximum 1000 characters allowed.';
    }

    return 'Invalid value.';
  }

  // ============================================================
  // MINIMUM END TIME
  // ============================================================

  getMinimumEndTime(): string {

    const startTime =
      this.scheduleForm.get(
        'startTime'
      )?.value;

    return startTime || '';
  }

  // ============================================================
  // CHECK DRIVER CONFLICT
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
      this.existingSchedules
    );
  }

  // ============================================================
  // CHECK VEHICLE CONFLICT
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
      this.existingSchedules
    );
  }
}