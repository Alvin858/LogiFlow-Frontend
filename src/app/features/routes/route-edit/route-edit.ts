import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormArray,FormBuilder,FormGroup,ReactiveFormsModule,Validators} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {CreateRouteRequest,CreateRouteStopRequest,Route} from '../../../core/models/module3.models';
import { RouteService } from '../../../core/services/route.service';

@Component({
  selector: 'app-route-edit',
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
  templateUrl: './route-edit.html',
  styleUrl: './route-edit.css'
})
export class RouteEditComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly routeService = inject(RouteService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  routeId!: number;

  loading = true;
  saving = false;
  errorMessage = '';

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
      1,
      [
        Validators.required,
        Validators.min(1)
      ]
    ],

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

  get stops(): FormArray {
    return this.routeForm.get('stops') as FormArray;
  }

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

  private loadRoute(): void {
    this.loading = true;
    this.errorMessage = '';

    this.routeService.getRouteById(this.routeId).subscribe({
      next: (route: Route) => {
        this.populateForm(route);
        this.loading = false;
      },

      error: (error) => {
        console.error('Error loading route:', error);

        this.errorMessage =
          error?.message || 'Unable to load route.';

        this.loading = false;
      }
    });
  }

  private populateForm(route: Route): void {
    this.routeForm.patchValue({
      startLocation: route.startLocation,
      destination: route.destination,
      distance: route.distance,
      estimatedDuration: route.estimatedDuration
    });

    this.stops.clear();

    const sortedStops = [...(route.stops ?? [])]
      .sort((a, b) => a.stopOrder - b.stopOrder);

    sortedStops.forEach((stop, index) => {
      this.stops.push(
        this.createStopGroup({
          stopOrder: index + 1,
          address: stop.address,
          latitude: stop.latitude,
          longitude: stop.longitude,
          location: stop.location
        })
      );
    });

    if (this.stops.length === 0) {
      this.addStop();
    }

    this.updateStopOrders();
  }

  addStop(): void {
    this.stops.push(
      this.createStopGroup({
        stopOrder: this.stops.length + 1
      })
    );

    this.updateStopOrders();
  }

  removeStop(index: number): void {
    if (this.stops.length <= 1) {
      this.snackBar.open(
        'A route must contain at least one stop.',
        'Close',
        { duration: 3000 }
      );

      return;
    }

    this.stops.removeAt(index);
    this.updateStopOrders();
  }

  moveStopUp(index: number): void {
    if (index <= 0) {
      return;
    }

    const current = this.stops.at(index);
    const previous = this.stops.at(index - 1);

    this.stops.removeAt(index);
    this.stops.insert(index - 1, current);

    void previous;

    this.updateStopOrders();
  }

  moveStopDown(index: number): void {
    if (index >= this.stops.length - 1) {
      return;
    }

    const current = this.stops.at(index);

    this.stops.removeAt(index);
    this.stops.insert(index + 1, current);

    this.updateStopOrders();
  }

  private updateStopOrders(): void {
    this.stops.controls.forEach((control, index) => {
      control.get('stopOrder')?.setValue(index + 1);
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.routeForm.get(controlName);

    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched)
    );
  }

  isStopInvalid(
    index: number,
    controlName: string
  ): boolean {
    const control = this.stops
      .at(index)
      .get(controlName);

    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched)
    );
  }

  private buildRequest(): CreateRouteRequest {
    const formValue = this.routeForm.getRawValue();

    const stops: CreateRouteStopRequest[] =
      this.stops.controls.map((control, index) => {
        const value = control.value;

        return {
          stopOrder: index + 1,
          address: String(value.address ?? '').trim(),
          latitude:
            value.latitude === null ||
            value.latitude === ''
              ? null
              : Number(value.latitude),

          longitude:
            value.longitude === null ||
            value.longitude === ''
              ? null
              : Number(value.longitude),

          location:
            String(value.location ?? '').trim() || null
        };
      });

    return {
      startLocation:
        String(formValue.startLocation ?? '').trim(),

      destination:
        String(formValue.destination ?? '').trim(),

      distance: Number(formValue.distance),

      estimatedDuration:
        Number(formValue.estimatedDuration),

      stops
    };
  }

  submit(): void {
    this.errorMessage = '';

    if (this.routeForm.invalid) {
      this.routeForm.markAllAsTouched();

      this.snackBar.open(
        'Please correct the highlighted fields.',
        'Close',
        { duration: 3000 }
      );

      return;
    }

    const request = this.buildRequest();

   const validation =
  this.routeService.validateRoute(request);

if (!validation.valid) {
  this.errorMessage =
    validation.errors?.join(' ') ||
    validation.message ||
    'Invalid route data.';

  this.snackBar.open(
    this.errorMessage,
    'Close',
    { duration: 4000 }
  );

  return;
}

    this.saving = true;

    this.routeService
      .updateRoute(this.routeId, request)
      .subscribe({
        next: (updatedRoute) => {
          this.saving = false;

          this.snackBar.open(
            'Route updated successfully.',
            'Close',
            { duration: 3000 }
          );

          const id = updatedRoute?.id ?? this.routeId;

          this.router.navigate([
            '/routes',
            id
          ]);
        },

        error: (error) => {
          console.error(
            'Error updating route:',
            error
          );

          this.saving = false;

          this.errorMessage =
            error?.message ||
            'Unable to update route.';

          this.snackBar.open(
            this.errorMessage,
            'Close',
            { duration: 4000 }
          );
        }
      });
  }

  cancel(): void {
    this.router.navigate([
      '/routes',
      this.routeId
    ]);
  }

  goBack(): void {
    this.router.navigate(['/routes']);
  }
}