import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CreateVehicleRequest, UpdateVehicleRequest, UpdateVehicleStatusRequest, VehicleResponse
} from '../models/fleet.models';

@Injectable({ providedIn: 'root' })
export class VehicleService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/vehicles';

  getAll(): Observable<VehicleResponse[]> { return this.http.get<VehicleResponse[]>(this.base); }
  getById(id: number): Observable<VehicleResponse> { return this.http.get<VehicleResponse>(`${this.base}/${id}`); }
  create(request: CreateVehicleRequest): Observable<VehicleResponse> { return this.http.post<VehicleResponse>(this.base, request); }
  update(id: number, request: UpdateVehicleRequest): Observable<VehicleResponse> { return this.http.put<VehicleResponse>(`${this.base}/${id}`, request); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/${id}`); }
  updateStatus(id: number, request: UpdateVehicleStatusRequest): Observable<VehicleResponse> {
    return this.http.patch<VehicleResponse>(`${this.base}/${id}/status`, request);
  }
}
