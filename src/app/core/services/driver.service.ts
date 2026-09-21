import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {CreateDriverRequest, DriverResponse, UpdateDriverAvailabilityRequest, UpdateDriverRequest} from '../models/fleet.models';

@Injectable({ providedIn: 'root' })
export class DriverService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/drivers';

  getAll(): Observable<DriverResponse[]> { return this.http.get<DriverResponse[]>(this.base); }
  getById(id: number): Observable<DriverResponse> { return this.http.get<DriverResponse>(`${this.base}/${id}`); }
  create(request: CreateDriverRequest): Observable<DriverResponse> { return this.http.post<DriverResponse>(this.base, request); }
  update(id: number, request: UpdateDriverRequest): Observable<DriverResponse> { return this.http.put<DriverResponse>(`${this.base}/${id}`, request); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/${id}`); }
  updateAvailability(id: number, request: UpdateDriverAvailabilityRequest): Observable<DriverResponse> {
    return this.http.patch<DriverResponse>(`${this.base}/${id}/availability`, request);
  }
}
