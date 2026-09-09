import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AddressResponse, CreateAddressRequest, CustomerResponse, UpdateAddressRequest,
  UpdateCustomerProfileRequest
} from '../models/customer.models';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/customers';

  getProfile(): Observable<CustomerResponse> { return this.http.get<CustomerResponse>(`${this.base}/profile`); }
  updateProfile(request: UpdateCustomerProfileRequest): Observable<CustomerResponse> {
    return this.http.put<CustomerResponse>(`${this.base}/profile`, request);
  }
  getAddresses(): Observable<AddressResponse[]> { return this.http.get<AddressResponse[]>(`${this.base}/addresses`); }
  addAddress(request: CreateAddressRequest): Observable<AddressResponse> {
    return this.http.post<AddressResponse>(`${this.base}/addresses`, request);
  }
  updateAddress(id: number, request: UpdateAddressRequest): Observable<AddressResponse> {
    return this.http.put<AddressResponse>(`${this.base}/addresses/${id}`, request);
  }
  deleteAddress(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/addresses/${id}`); }
  getById(id: number): Observable<CustomerResponse> { return this.http.get<CustomerResponse>(`${this.base}/${id}`); }
}
