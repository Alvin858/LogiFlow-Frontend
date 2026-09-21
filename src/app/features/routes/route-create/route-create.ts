import {
  ChangeDetectionStrategy,
  Component,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import {
  MatSnackBar,
  MatSnackBarModule
} from '@angular/material/snack-bar';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import {
  CreateRouteRequest,
  CreateRouteStopRequest
} from '../../../core/models/module3.models';

import { RouteService } from '../../../core/services/route.service';

@Component({
  selector: 'app-route-create',
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,

    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],

  templateUrl: './route-create.html',

  styleUrls: ['./route-create.css'
  ],

  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RouteCreateComponent {

  private readonly fb = inject(FormBuilder);

  private readonly routeService =
    inject(RouteService);

  private readonly router =
    inject(Router);

  private readonly snackBar =
    inject(MatSnackBar);

  loading = false;

  // ============================================================
  // ROUTE FORM
  // ============================================================

  routeForm = this.fb.group({

    startLocation: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(250)
      ]
    ],

    destination: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(250)
      ]
    ],

    distance: [
      0,
      [
        Validators.required,
        Validators.min(0)
      ]
    ],

    estimatedDuration: [
      0,
      [
        Validators.required,
        Validators.min(1)
      ]
    ],

    stops: this.fb.array([])

  });

  // ============================================================
  // STOPS
  // ============================================================

  get stops(): FormArray {
    return this.routeForm.get('stops') as FormArray;
  }

  // ============================================================
  // CREATE STOP FORM
  // ============================================================

  private createStop(): FormGroup {

    return this.fb.group({

      stopOrder: [
        1,
        [
          Validators.required,
          Validators.min(1)
        ]
      ],

      address: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(250)
        ]
      ],

      latitude: [
        null
      ],

      longitude: [
        null
      ],

      location: [
        '',
        [
          Validators.maxLength(250)
        ]
      ]

    });
  }

  // ============================================================
  // ADD STOP
  // ============================================================

  addStop(): void {

    const stop = this.createStop();

    this.stops.push(stop);

    this.updateStopNumbers();
  }

  // ============================================================
  // REMOVE STOP
  // ============================================================

  removeStop(index: number): void {

    if (
      index < 0 ||
      index >= this.stops.length
    ) {
      return;
    }

    if (this.stops.length <= 1) {

      this.snackBar.open(
        'A route must contain at least one stop.',
        'Close',
        {
          duration: 3000
        }
      );

      return;
    }

    this.stops.removeAt(index);

    this.updateStopNumbers();
  }

  // ============================================================
  // MOVE STOP UP
  // ============================================================

  moveStopUp(index: number): void {

    if (index <= 0) {
      return;
    }

    const current =
      this.stops.at(index);

    const previous =
      this.stops.at(index - 1);

    this.stops.setControl(
      index - 1,
      current
    );

    this.stops.setControl(
      index,
      previous
    );

    this.updateStopNumbers();
  }

  // ============================================================
  // MOVE STOP DOWN
  // ============================================================

  moveStopDown(index: number): void {

    if (
      index < 0 ||
      index >= this.stops.length - 1
    ) {
      return;
    }

    const current =
      this.stops.at(index);

    const next =
      this.stops.at(index + 1);

    this.stops.setControl(
      index,
      next
    );

    this.stops.setControl(
      index + 1,
      current
    );

    this.updateStopNumbers();
  }

  // ============================================================
  // UPDATE STOP NUMBERS
  // ============================================================

  private updateStopNumbers(): void {

    this.stops.controls.forEach(
      (control, index) => {

        control
          .get('stopOrder')
          ?.setValue(
            index + 1,
            {
              emitEvent: false
            }
          );

      }
    );
  }

  // ============================================================
  // FORM VALIDATION HELPERS
  // ============================================================

  isInvalid(
    controlName: string
  ): boolean {

    const control =
      this.routeForm.get(controlName);

    return !!(
      control &&
      control.invalid &&
      (
        control.dirty ||
        control.touched
      )
    );
  }

  isStopInvalid(
    index: number,
    controlName: string
  ): boolean {

    if (
      index < 0 ||
      index >= this.stops.length
    ) {
      return false;
    }

    const control =
      this.stops
        .at(index)
        .get(controlName);

    return !!(
      control &&
      control.invalid &&
      (
        control.dirty ||
        control.touched
      )
    );
  }

  // ============================================================
  // BUILD CREATE REQUEST
  // ============================================================

  private buildRequest(): CreateRouteRequest {

    const formValue =
      this.routeForm.getRawValue();

    const stops: CreateRouteStopRequest[] =
      (formValue.stops ?? [])
        .map(
          (stop: any, index: number): CreateRouteStopRequest => {

            return {

              stopOrder:
                index + 1,

              address:
                String(
                  stop.address ?? ''
                ).trim(),

              latitude:
                stop.latitude === null ||
                stop.latitude === '' ||
                stop.latitude === undefined
                  ? null
                  : Number(stop.latitude),

              longitude:
                stop.longitude === null ||
                stop.longitude === '' ||
                stop.longitude === undefined
                  ? null
                  : Number(stop.longitude),

              location:
                String(
                  stop.location ?? ''
                ).trim() || null

            };
          }
        );

    return {

      startLocation:
        String(
          formValue.startLocation ?? ''
        ).trim(),

      destination:
        String(
          formValue.destination ?? ''
        ).trim(),

      distance:
        Number(
          formValue.distance ?? 0
        ),

      estimatedDuration:
        Number(
          formValue.estimatedDuration ?? 0
        ),

      stops

    };
  }

  // ============================================================
  // CREATE ROUTE
  // ============================================================

  createRoute(): void {

    this.errorMessage = '';

    // ----------------------------------------------------------
    // FORM VALIDATION
    // ----------------------------------------------------------

    if (this.routeForm.invalid) {

      this.routeForm.markAllAsTouched();

      this.snackBar.open(
        'Please correct the highlighted fields.',
        'Close',
        {
          duration: 3500
        }
      );

      return;
    }

    // ----------------------------------------------------------
    // MAKE SURE STOP ORDERS ARE CORRECT
    // ----------------------------------------------------------

    this.updateStopNumbers();

    // ----------------------------------------------------------
    // BUILD REQUEST
    // ----------------------------------------------------------

    const request =
      this.buildRequest();

    // ----------------------------------------------------------
    // SERVICE VALIDATION
    // ----------------------------------------------------------

    const validation =
      this.routeService.validateRoute(
        request
      );

    if (!validation.valid) {

      const message =
        validation.message ||
        validation.errors?.join(' ') ||
        'Please provide valid route and stop information.';

      this.snackBar.open(
        message,
        'Close',
        {
          duration: 4000
        }
      );

      return;
    }

    // ----------------------------------------------------------
    // SEND TO API
    // ----------------------------------------------------------

    this.loading = true;

    this.routeService
      .createRoute(request)
      .subscribe({

        next: (createdRoute) => {

          this.loading = false;

          this.snackBar.open(
            'Route created successfully.',
            'Close',
            {
              duration: 3000
            }
          );

          if (createdRoute?.id) {

            this.router.navigate([
              '/routes',
              createdRoute.id
            ]);

          } else {

            this.router.navigate([
              '/routes'
            ]);

          }
        },

        error: (error: Error) => {

          this.loading = false;

          this.snackBar.open(
            error?.message ||
            'Unable to create route.',
            'Close',
            {
              duration: 5000
            }
          );

        }

      });
  }

  // ============================================================
  // CANCEL
  // ============================================================

  cancel(): void {

    this.router.navigate([
      '/routes'
    ]);
  }

  // ============================================================
  // RESET FORM
  // ============================================================

  resetForm(): void {

    this.routeForm.reset({

      startLocation: '',
      destination: '',
      distance: 0,
      estimatedDuration: 0

    });

    this.stops.clear();

    this.loading = false;
  }

  // ============================================================
  // ERROR MESSAGE
  // ============================================================

  errorMessage = '';

}