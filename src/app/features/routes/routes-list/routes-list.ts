// src/app/features/routes/route-list/route-list.component.ts

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
  Router
} from '@angular/router';

import {
  MatTableModule
} from '@angular/material/table';

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
  MatCardModule
} from '@angular/material/card';

import {
  MatTooltipModule
} from '@angular/material/tooltip';

import {
  MatDialog,
  MatDialogModule
} from '@angular/material/dialog';

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
  selector: 'app-route-list',
  standalone: true,

  imports: [
    CommonModule,

    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule
  ],

  templateUrl: './routes-list.html',
  styleUrls: ['./routes-list.css'],

  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RouteListComponent implements OnInit {

  private readonly routeService =
    inject(RouteService);

  private readonly router =
    inject(Router);

  private readonly snackBar =
    inject(MatSnackBar);

  /*
   * Angular Material table columns.
   */
  displayedColumns: string[] = [
    'id',
    'startLocation',
    'destination',
    'distance',
    'estimatedDuration',
    'stops',
    'actions'
  ];

  /*
   * Routes returned by the backend.
   */
  routes: RouteModel[] = [];

  /*
   * Loading state.
   */
  loading = false;

  /*
   * Error message.
   */
  errorMessage = '';


  /* ============================================================
     INITIALIZATION
     ============================================================ */

  ngOnInit(): void {
    this.loadRoutes();
  }


  /* ============================================================
     LOAD ROUTES
     ============================================================ */

  loadRoutes(): void {

    this.loading = true;
    this.errorMessage = '';

    this.routeService
      .getRoutes()
      .subscribe({

        next: (data) => {

          this.routes = data ?? [];

          this.loading = false;
        },

        error: (error: Error) => {

          this.loading = false;

          this.errorMessage =
            error.message ||
            'Unable to load routes.';
        }

      });
  }


  /* ============================================================
     CREATE ROUTE
     ============================================================ */

  createRoute(): void {

    this.router.navigate([
      '/routes/create'
    ]);
  }


  /* ============================================================
     VIEW ROUTE
     ============================================================ */

  viewRoute(route: RouteModel): void {

    if (!route.id) {
      return;
    }

    this.router.navigate([
      '/routes',
      route.id
    ]);
  }


  /* ============================================================
     EDIT ROUTE
     ============================================================ */

  editRoute(route: RouteModel): void {

    if (!route.id) {
      return;
    }

    this.router.navigate([
      '/routes',
      route.id,
      'edit'
    ]);
  }


  /* ============================================================
     ROUTE PLANNER
     ============================================================ */

  openPlanner(route: RouteModel): void {

    if (!route.id) {
      return;
    }

    this.router.navigate([
      '/routes',
      route.id,
      'planner'
    ]);
  }


  /* ============================================================
     DELETE ROUTE
     ============================================================ */

  deleteRoute(route: RouteModel): void {

    if (!route.id) {
      return;
    }

    const confirmed =
      window.confirm(
        `Are you sure you want to delete route #${route.id}?`
      );

    if (!confirmed) {
      return;
    }

    this.routeService
      .deleteRoute(route.id)
      .subscribe({

        next: () => {

          this.snackBar.open(
            'Route deleted successfully.',
            'Close',
            {
              duration: 3000
            }
          );

          this.loadRoutes();
        },

        error: (error: Error) => {

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

    /*
     * The model stores duration as a number.
     *
     * We currently display it as minutes.
     */
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
     TRACK BY
     ============================================================ */

  trackByRouteId(
    index: number,
    route: RouteModel
  ): number {

    return route.id ?? index;
  }
}