// src/app/features/routes/route-detail/route-detail.component.ts

import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  MatCardModule
} from '@angular/material/card';

import {
  MatButtonModule
} from '@angular/material/button';

import {
  MatIconModule
} from '@angular/material/icon';

import {
  MatProgressSpinnerModule
} from '@angular/material/progress-spinner';

import {
  MatSnackBar,
  MatSnackBarModule
} from '@angular/material/snack-bar';

import {
  Route as RouteModel
} from '../../../core/models/module3.models';

import {
  RouteService
} from '../../../core/services/route.service';


@Component({
  selector: 'app-route-detail',

  standalone: true,

  imports: [
    CommonModule,

    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],

  templateUrl: './route-detail.html',

  styleUrls: [
    './route-detail.css'
  ],

  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RouteDetailComponent
  implements OnInit {

  private readonly routeService =
    inject(RouteService);

  private readonly activatedRoute =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly snackBar =
    inject(MatSnackBar);


  route: RouteModel | null = null;

  loading = false;

  deleting = false;

  errorMessage = '';


  /* ============================================================
     INITIALIZATION
     ============================================================ */

  ngOnInit(): void {

    const id =
      Number(
        this.activatedRoute.snapshot
          .paramMap
          .get('id')
      );

    if (!id || id <= 0) {

      this.errorMessage =
        'Invalid route ID.';

      return;
    }

    this.loadRoute(id);
  }


  /* ============================================================
     LOAD ROUTE
     ============================================================ */

  loadRoute(id: number): void {

    this.loading = true;

    this.errorMessage = '';

    this.routeService
      .getRouteById(id)
      .subscribe({

        next: (route) => {

          this.route = route;

          this.loading = false;

        },

        error: (error: Error) => {

          this.loading = false;

          this.errorMessage =
            error.message ||
            'Unable to load route.';

        }

      });
  }


  /* ============================================================
     BACK
     ============================================================ */

  backToRoutes(): void {

    this.router.navigate([
      '/routes'
    ]);
  }


  /* ============================================================
     EDIT
     ============================================================ */

  editRoute(): void {

    if (!this.route?.id) {
      return;
    }

    this.router.navigate([
      '/routes',
      'edit',
      this.route.id
    ]);
  }


  /* ============================================================
     ROUTE PLANNER
     ============================================================ */

  openPlanner(): void {

    if (!this.route?.id) {
      return;
    }

    this.router.navigate([
      '/routes',
      this.route.id,
      'planner'
    ]);
  }


  /* ============================================================
     DELETE
     ============================================================ */

  deleteRoute(): void {

    if (!this.route?.id) {
      return;
    }

    const confirmed =
      window.confirm(
        `Are you sure you want to delete route #${this.route.id}?`
      );

    if (!confirmed) {
      return;
    }

    this.deleting = true;

    this.routeService
      .deleteRoute(this.route.id)
      .subscribe({

        next: () => {

          this.deleting = false;

          this.snackBar.open(
            'Route deleted successfully.',
            'Close',
            {
              duration: 3000
            }
          );

          this.router.navigate([
            '/routes'
          ]);
        },

        error: (error: Error) => {

          this.deleting = false;

          this.snackBar.open(
            error.message ||
            'Unable to delete route.',
            'Close',
            {
              duration: 4000
            }
          );
        }

      });
  }


  /* ============================================================
     FORMAT DISTANCE
     ============================================================ */

  formatDistance(
    distance: number | null | undefined
  ): string {

    if (
      distance === null ||
      distance === undefined
    ) {
      return '-';
    }

    return `${distance} km`;
  }


  /* ============================================================
     FORMAT DURATION
     ============================================================ */

  formatDuration(
    duration: number | null | undefined
  ): string {

    if (
      duration === null ||
      duration === undefined
    ) {
      return '-';
    }

    if (duration < 60) {
      return `${duration} min`;
    }

    const hours =
      Math.floor(duration / 60);

    const minutes =
      duration % 60;

    if (minutes === 0) {
      return `${hours} hr`;
    }

    return `${hours} hr ${minutes} min`;
  }


  /* ============================================================
     TRACK STOP
     ============================================================ */

  trackByStop(
    index: number,
    stop: {
      id?: number;
      stopOrder: number;
    }
  ): number {

    return stop.id ?? stop.stopOrder ?? index;
  }
}