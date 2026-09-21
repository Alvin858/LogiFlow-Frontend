import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {FormArray,FormBuilder,FormGroup,ReactiveFormsModule,Validators} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {MatSnackBar,MatSnackBarModule} from '@angular/material/snack-bar';
import {CreateRouteRequest,CreateRouteStopRequest,Route,ValidationResult} from '../../../core/models/module3.models';
import { RouteService } from '../../../core/services/route.service';

@Component({
  selector: 'app-route-planner',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './route-planner.html',
  styleUrl: './route-planner.css'
})
export class RoutePlannerComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly routeService = inject(RouteService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  routeId!: number;

  route: Route | null = null;

  loading = true;
  saving = false;

  errorMessage = '';

  plannerForm = this.fb.group({
    stops: this.fb.array([])
  });

  ngOnInit(): void {
    const id = Number(
      this.activatedRoute.snapshot.paramMap.get('id')
    );

    if (!id || id <= 0) {
      this.errorMessage = 'Invalid route ID.';
      this.loading = false;
      return;
    }

    this.routeId = id;

    this.loadRoute();
  }

  // ----------------------------------------------------
  // GETTERS
  // ----------------------------------------------------

  get stops(): FormArray {
    return this.plannerForm.get('stops') as FormArray;
  }

  // ----------------------------------------------------
  // CREATE STOP FORM
  // ----------------------------------------------------

  private createStopGroup(
    stop?: Partial<CreateRouteStopRequest>
  ): FormGroup {

    return this.fb.group({

      stopOrder: [
        stop?.stopOrder ?? 1,
        [
          Validators.required,
          Validators.min(1)
        ]
      ],

      address: [
        stop?.address ?? '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(300)
        ]
      ],

      latitude: [
        stop?.latitude ?? null
      ],

      longitude: [
        stop?.longitude ?? null
      ],

      location: [
        stop?.location ?? '',
        [
          Validators.maxLength(250)
        ]
      ]

    });
  }

  // ----------------------------------------------------
  // LOAD ROUTE
  // ----------------------------------------------------

  private loadRoute(): void {

    this.loading = true;
    this.errorMessage = '';

    this.routeService
      .getRouteById(this.routeId)
      .subscribe({

        next: (route: Route) => {

          this.route = route;

          this.populateStops(route);

          this.loading = false;
        },

        error: (error) => {

          console.error(
            'Error loading route:',
            error
          );

          this.errorMessage =
            error?.message ||
            'Unable to load route.';

          this.loading = false;
        }

      });
  }

  // ----------------------------------------------------
  // POPULATE STOPS
  // ----------------------------------------------------

  private populateStops(route: Route): void {

    this.stops.clear();

    const sortedStops = [
      ...(route.stops ?? [])
    ].sort(
      (a, b) => a.stopOrder - b.stopOrder
    );

    sortedStops.forEach(
      (stop, index) => {

        this.stops.push(
          this.createStopGroup({

            stopOrder: index + 1,

            address: stop.address,

            latitude:
              stop.latitude ?? null,

            longitude:
              stop.longitude ?? null,

            location:
              stop.location ?? null

          })
        );

      }
    );

    /*
     * If backend returns no stops,
     * create one empty stop.
     */
    if (this.stops.length === 0) {
      this.addStop();
    }

    this.updateStopOrders();
  }

  // ----------------------------------------------------
  // ADD STOP
  // ----------------------------------------------------

  addStop(): void {

    this.stops.push(
      this.createStopGroup({
        stopOrder: this.stops.length + 1
      })
    );

    this.updateStopOrders();
  }

  // ----------------------------------------------------
  // REMOVE STOP
  // ----------------------------------------------------

  removeStop(index: number): void {

    /*
     * At least one stop is required.
     */
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

    this.updateStopOrders();
  }

  // ----------------------------------------------------
  // MOVE STOP UP
  // ----------------------------------------------------

  moveStopUp(index: number): void {

    if (index <= 0) {
      return;
    }

    const currentStop =
      this.stops.at(index);

    this.stops.removeAt(index);

    this.stops.insert(
      index - 1,
      currentStop
    );

    this.updateStopOrders();
  }

  // ----------------------------------------------------
  // MOVE STOP DOWN
  // ----------------------------------------------------

  moveStopDown(index: number): void {

    if (
      index < 0 ||
      index >= this.stops.length - 1
    ) {
      return;
    }

    const currentStop =
      this.stops.at(index);

    this.stops.removeAt(index);

    this.stops.insert(
      index + 1,
      currentStop
    );

    this.updateStopOrders();
  }

  // ----------------------------------------------------
  // UPDATE STOP ORDER
  // ----------------------------------------------------

  private updateStopOrders(): void {

    this.stops.controls.forEach(
      (control, index) => {

        control
          .get('stopOrder')
          ?.setValue(index + 1);

      }
    );
  }

  // ----------------------------------------------------
  // STOP VALIDATION
  // ----------------------------------------------------

  isStopInvalid(
    index: number,
    controlName: string
  ): boolean {

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

  // ----------------------------------------------------
  // BUILD UPDATE REQUEST
  // ----------------------------------------------------

  private buildRequest(): CreateRouteRequest {

    const stops: CreateRouteStopRequest[] =
      this.stops.controls.map(
        (control, index) => {

          const value = control.value;

          let latitude:
            number | null = null;

          let longitude:
            number | null = null;

          /*
           * Convert latitude safely.
           */
          if (
            value.latitude !== null &&
            value.latitude !== undefined &&
            value.latitude !== ''
          ) {
            latitude =
              Number(value.latitude);
          }

          /*
           * Convert longitude safely.
           */
          if (
            value.longitude !== null &&
            value.longitude !== undefined &&
            value.longitude !== ''
          ) {
            longitude =
              Number(value.longitude);
          }

          return {

            stopOrder: index + 1,

            address:
              String(
                value.address ?? ''
              ).trim(),

            latitude,

            longitude,

            location:
              String(
                value.location ?? ''
              ).trim() || null

          };

        }
      );

    return {

      startLocation:
        this.route?.startLocation ?? '',

      destination:
        this.route?.destination ?? '',

      distance:
        Number(
          this.route?.distance ?? 0
        ),

      estimatedDuration:
        Number(
          this.route?.estimatedDuration ?? 1
        ),

      stops

    };
  }

  // ----------------------------------------------------
  // SAVE ROUTE PLAN
  // ----------------------------------------------------

  savePlanner(): void {

    this.errorMessage = '';

    /*
     * Check Angular form validation.
     */
    if (this.plannerForm.invalid) {

      this.plannerForm.markAllAsTouched();

      this.snackBar.open(
        'Please correct the stop information.',
        'Close',
        {
          duration: 3000
        }
      );

      return;
    }

    const request =
      this.buildRequest();

    /*
     * Validate route using RouteService.
     */
    const validation: ValidationResult =
      this.routeService.validateRoute(
        request
      );

    /*
     * Stop if validation failed.
     */
    if (!validation.valid) {

      this.errorMessage =
        validation.errors?.join(' ') ||
        validation.message ||
        'Invalid route information.';

      this.snackBar.open(
        this.errorMessage,
        'Close',
        {
          duration: 4000
        }
      );

      return;
    }

    /*
     * Start saving.
     */
    this.saving = true;

    this.routeService
      .updateRoute(
        this.routeId,
        request
      )
      .subscribe({

        next: (updatedRoute: Route) => {

          this.saving = false;

          /*
           * Update local route data.
           */
          this.route = updatedRoute;

          /*
           * Show success message.
           */
          this.snackBar.open(
            'Route plan saved successfully.',
            'Close',
            {
              duration: 3000
            }
          );

          /*
           * Reload route from backend.
           */
          this.loadRoute();
        },

        error: (error) => {

          console.error(
            'Error saving route plan:',
            error
          );

          this.saving = false;

          this.errorMessage =
            error?.message ||
            'Unable to save route plan.';

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

  // ----------------------------------------------------
  // VIEW ROUTE
  // ----------------------------------------------------

  viewRoute(): void {

    this.router.navigate([
      '/routes',
      this.routeId
    ]);
  }

  // ----------------------------------------------------
  // EDIT ROUTE
  // ----------------------------------------------------

  editRoute(): void {

    this.router.navigate([
      '/routes/edit',
      this.routeId
    ]);
  }

  // ----------------------------------------------------
  // BACK TO ROUTES
  // ----------------------------------------------------

  backToRoutes(): void {

    this.router.navigate([
      '/routes'
    ]);
  }
}