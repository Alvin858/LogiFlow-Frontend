import {
  Injectable,
  inject
} from '@angular/core';

import {
  HttpClient,
  HttpErrorResponse
} from '@angular/common/http';

import {
  Observable,
  throwError
} from 'rxjs';

import {
  catchError
} from 'rxjs/operators';

import {
  Route,
  CreateRouteRequest,
  UpdateRouteRequest,
  ValidationResult
} from '../models/module3.models';

@Injectable({
  providedIn: 'root'
})
export class RouteService {

  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    'https://localhost:7080/api/routes';

  // ============================================================
  // GET ALL ROUTES
  // ============================================================

  getRoutes(): Observable<Route[]> {

    return this.http
      .get<Route[]>(
        this.apiUrl
      )
      .pipe(
        catchError(
          error => this.handleError(error)
        )
      );
  }

  // ============================================================
  // GET ROUTE BY ID
  // ============================================================

  getRouteById(
    id: number
  ): Observable<Route> {

    return this.http
      .get<Route>(
        `${this.apiUrl}/${id}`
      )
      .pipe(
        catchError(
          error => this.handleError(error)
        )
      );
  }

  // ============================================================
  // CREATE ROUTE
  // ============================================================

  createRoute(
    request: CreateRouteRequest
  ): Observable<Route> {

    return this.http
      .post<Route>(
        this.apiUrl,
        request
      )
      .pipe(
        catchError(
          error => this.handleError(error)
        )
      );
  }

  // ============================================================
  // UPDATE ROUTE
  // ============================================================

  updateRoute(
    id: number,
    request: UpdateRouteRequest
  ): Observable<Route> {

    return this.http
      .put<Route>(
        `${this.apiUrl}/${id}`,
        request
      )
      .pipe(
        catchError(
          error => this.handleError(error)
        )
      );
  }

  // ============================================================
  // DELETE ROUTE
  // ============================================================

  deleteRoute(
    id: number
  ): Observable<void> {

    return this.http
      .delete<void>(
        `${this.apiUrl}/${id}`
      )
      .pipe(
        catchError(
          error => this.handleError(error)
        )
      );
  }

  // ============================================================
  // VALIDATE ROUTE
  // ============================================================

  validateRoute(
    route:
      CreateRouteRequest |
      UpdateRouteRequest
  ): ValidationResult {

    const errors: string[] = [];

    // ----------------------------------------------------------
    // START LOCATION
    // ----------------------------------------------------------

    if (
      !route.startLocation ||
      !route.startLocation.trim()
    ) {

      errors.push(
        'Start location is required.'
      );
    }

    // ----------------------------------------------------------
    // DESTINATION
    // ----------------------------------------------------------

    if (
      !route.destination ||
      !route.destination.trim()
    ) {

      errors.push(
        'Destination is required.'
      );
    }

    // ----------------------------------------------------------
    // DISTANCE
    // ----------------------------------------------------------

    if (
      !Number.isFinite(
        route.distance
      ) ||
      route.distance < 0
    ) {

      errors.push(
        'Distance must be a valid non-negative number.'
      );
    }

    // ----------------------------------------------------------
    // ESTIMATED DURATION
    // ----------------------------------------------------------

    if (
      !Number.isFinite(
        route.estimatedDuration
      ) ||
      route.estimatedDuration < 0
    ) {

      errors.push(
        'Estimated duration must be a valid non-negative number.'
      );
    }

    // ----------------------------------------------------------
    // STOPS
    // ----------------------------------------------------------

    if (
      !route.stops ||
      route.stops.length === 0
    ) {

      errors.push(
        'At least one route stop is required.'
      );

    } else {

      // --------------------------------------------------------
      // STOP ORDER AND ADDRESS
      // --------------------------------------------------------

      route.stops.forEach(
        (stop, index) => {

          const expectedOrder =
            index + 1;

          if (
            Number(stop.stopOrder) !==
            expectedOrder
          ) {

            errors.push(
              `Stop ${index + 1} must have stop order ${expectedOrder}.`
            );
          }

          if (
            !stop.address ||
            !stop.address.trim()
          ) {

            errors.push(
              `Stop ${index + 1} address is required.`
            );
          }

          // ----------------------------------------------------
          // LATITUDE
          // ----------------------------------------------------

          if (
            stop.latitude !== null &&
            stop.latitude !== undefined
          ) {

            if (
              !Number.isFinite(
                Number(stop.latitude)
              ) ||
              Number(stop.latitude) < -90 ||
              Number(stop.latitude) > 90
            ) {

              errors.push(
                `Stop ${index + 1} latitude must be between -90 and 90.`
              );
            }
          }

          // ----------------------------------------------------
          // LONGITUDE
          // ----------------------------------------------------

          if (
            stop.longitude !== null &&
            stop.longitude !== undefined
          ) {

            if (
              !Number.isFinite(
                Number(stop.longitude)
              ) ||
              Number(stop.longitude) < -180 ||
              Number(stop.longitude) > 180
            ) {

              errors.push(
                `Stop ${index + 1} longitude must be between -180 and 180.`
              );
            }
          }

        }
      );
    }

    // ----------------------------------------------------------
    // RETURN VALIDATION RESULT
    // ----------------------------------------------------------

    return {

      valid:
        errors.length === 0,

      message:
        errors.length === 0
          ? 'Route information is valid.'
          : errors.join(' '),

      errors

    };
  }

  // ============================================================
  // REORDER STOPS
  // ============================================================

  reorderStops(
    route: Route
  ): Route {

    const sortedStops =
      [...(route.stops ?? [])]
        .sort(
          (a, b) =>
            a.stopOrder -
            b.stopOrder
        )
        .map(
          (stop, index) => ({
            ...stop,
            stopOrder:
              index + 1
          })
        );

    return {

      ...route,

      stops:
        sortedStops

    };
  }

  // ============================================================
  // ADD STOP
  // ============================================================

  addStop(
    route: Route,
    address: string,
    latitude?: number | null,
    longitude?: number | null
  ): Route {

    const nextOrder =
      (route.stops?.length ?? 0) + 1;

    const newStop = {

      stopOrder:
        nextOrder,

      address:
        address.trim(),

      latitude:
        latitude ?? null,

      longitude:
        longitude ?? null,

      location:
        null

    };

    return {

      ...route,

      stops: [

        ...(route.stops ?? []),

        newStop

      ]

    };
  }

  // ============================================================
  // REMOVE STOP
  // ============================================================

  removeStop(
    route: Route,
    stopOrder: number
  ): Route {

    const remainingStops =
      (route.stops ?? [])
        .filter(
          stop =>
            stop.stopOrder !==
            stopOrder
        )
        .map(
          (stop, index) => ({

            ...stop,

            stopOrder:
              index + 1

          })
        );

    return {

      ...route,

      stops:
        remainingStops

    };
  }

  // ============================================================
  // ERROR HANDLING
  // ============================================================

  private handleError(
    error: HttpErrorResponse
  ): Observable<never> {

    let message =
      'An unexpected error occurred.';

    // ----------------------------------------------------------
    // CONNECTION ERROR
    // ----------------------------------------------------------

    if (
      error.status === 0
    ) {

      message =
        'Unable to connect to the LogiFlow API. ' +
        'Make sure the backend is running.';

    }

    // ----------------------------------------------------------
    // BAD REQUEST
    // ----------------------------------------------------------

    else if (
      error.status === 400
    ) {

      message =
        error.error?.message ??
        'Invalid route information.';

    }

    // ----------------------------------------------------------
    // UNAUTHORIZED
    // ----------------------------------------------------------

    else if (
      error.status === 401
    ) {

      message =
        'You are not authorized to perform this operation.';

    }

    // ----------------------------------------------------------
    // FORBIDDEN
    // ----------------------------------------------------------

    else if (
      error.status === 403
    ) {

      message =
        'You do not have permission to manage routes.';

    }

    // ----------------------------------------------------------
    // NOT FOUND
    // ----------------------------------------------------------

    else if (
      error.status === 404
    ) {

      message =
        'The requested route was not found.';

    }

    // ----------------------------------------------------------
    // CONFLICT
    // ----------------------------------------------------------

    else if (
      error.status === 409
    ) {

      message =
        error.error?.message ??
        'The route conflicts with existing data.';

    }

    // ----------------------------------------------------------
    // SERVER ERROR
    // ----------------------------------------------------------

    else if (
      error.status >= 500
    ) {

      message =
        'The server encountered an error while processing the route.';

    }

    return throwError(
      () => new Error(message)
    );
  }

}