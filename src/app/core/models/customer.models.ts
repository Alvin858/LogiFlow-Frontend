export interface UpdateCustomerProfileRequest {
  companyName: string; contactPerson: string; taxNumber?: string | null; phoneNumber?: string | null;
}
export interface CreateAddressRequest {
  addressLine1: string; addressLine2?: string | null; city: string; state: string;
  postalCode: string; country: string; isDefault: boolean;
}
export type UpdateAddressRequest = CreateAddressRequest;
export interface AddressResponse extends CreateAddressRequest { id: number; }
export interface CustomerResponse {
  id: number; userId: number; companyName: string; contactPerson: string;
  taxNumber: string | null; email: string; phoneNumber: string | null; addresses: AddressResponse[];
}
