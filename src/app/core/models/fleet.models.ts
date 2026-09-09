export enum VehicleStatus { Available = 1, InUse = 2, Maintenance = 3, Inactive = 4 }
export interface CreateVehicleRequest {
  vehicleType: string; registrationNumber: string; capacityKg: number; status: VehicleStatus;
  insuranceExpiryDate?: string | null; fitnessExpiryDate?: string | null;
}
export type UpdateVehicleRequest = CreateVehicleRequest;
export interface UpdateVehicleStatusRequest { status: VehicleStatus; }
export interface VehicleResponse extends CreateVehicleRequest {
  id: number; createdAtUtc: string;
}

export interface CreateDriverRequest {
  firstName: string; lastName: string; email: string; password: string; phoneNumber?: string | null;
  licenseNumber: string; licenseExpiryDate: string; experienceYears: number; isAvailable: boolean;
}
export interface UpdateDriverRequest {
  firstName: string; lastName: string; phoneNumber?: string | null; licenseNumber: string;
  licenseExpiryDate: string; experienceYears: number; isAvailable: boolean;
}
export interface UpdateDriverAvailabilityRequest { isAvailable: boolean; }
export interface DriverResponse {
  id: number; userId: number; firstName: string; lastName: string; email: string;
  phoneNumber: string | null; licenseNumber: string; licenseExpiryDate: string;
  experienceYears: number; isAvailable: boolean; isActive: boolean;
}
