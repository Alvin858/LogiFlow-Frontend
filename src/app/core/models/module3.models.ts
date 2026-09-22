// src/app/core/models/module3.models.ts

/* ============================================================
   M7 - ROUTE MANAGEMENT
   ============================================================ */

export interface RouteStop {
  id?: number;
  routeId?: number;

  stopOrder: number;
  address: string;

  latitude?: number | null;
  longitude?: number | null;

  location?: string | null;

  createdAt?: string;
  updatedAt?: string;
}

export interface Route {
  id?: number;

  startLocation: string;
  destination: string;

  distance: number;
  estimatedDuration: number;

  stops: RouteStop[];

  createdAt?: string;
  updatedAt?: string;
}


/* ============================================================
   M8 - DELIVERY MANAGEMENT
   ============================================================ */

export type DeliveryStatus =
  | 'Pending'
  | 'PickupConfirmed'
  | 'OutForDelivery'
  | 'Completed'
  | 'Failed';


export interface Delivery {
  id?: number;

  shipmentId: number;

  driverId: number;
  vehicleId: number;
  routeId: number;

  status: DeliveryStatus;

  pickupConfirmedAt?: string | null;
  outForDeliveryAt?: string | null;
  completedAt?: string | null;
  failedAt?: string | null;

  failureReason?: string | null;

  proofOfDelivery?: ProofOfDelivery | null;

  createdAt?: string;
  updatedAt?: string;
}


export interface ProofOfDelivery {
  id?: number;

  deliveryId: number;

  receiverName: string;

  receiverContact?: string | null;

  signaturePath?: string | null;

  photoPath?: string | null;

  remarks?: string | null;

  receivedAt?: string | null;

  createdAt?: string;
  updatedAt?: string;
}


/* ============================================================
   M9 - SCHEDULING MANAGEMENT
   ============================================================ */

export type ScheduleType =
  | 'Pickup'
  | 'Delivery';


export type ScheduleStatus =
  | 'Scheduled'
  | 'Rescheduled'
  | 'Cancelled'
  | 'Completed';


export interface Schedule {
  id?: number;

  type: ScheduleType;

  shipmentId?: number | null;

  routeId?: number | null;

  driverId: number;

  vehicleId: number;

  startTime: string;
  endTime: string;

  status: ScheduleStatus;

  notes?: string | null;

  createdAt?: string;
  updatedAt?: string;
}


/* ============================================================
   DRIVER / VEHICLE ASSIGNMENT
   Used by Route, Delivery and Scheduling screens
   ============================================================ */

export interface Module3Driver {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  available?: boolean;
}


export interface Module3Vehicle {
  id: number;
  registrationNumber?: string;
  vehicleNumber?: string;
  type?: string;
  available?: boolean;
}


/* ============================================================
   ROUTE REQUEST MODELS
   ============================================================ */

export interface CreateRouteRequest {
  startLocation: string;
  destination: string;

  distance: number;
  estimatedDuration: number;

  stops: CreateRouteStopRequest[];
}


export interface CreateRouteStopRequest {
  stopOrder: number;

  address: string;

  latitude?: number | null;
  longitude?: number | null;

  location?: string | null;
}


export interface UpdateRouteRequest {
  startLocation: string;
  destination: string;

  distance: number;
  estimatedDuration: number;

  stops: CreateRouteStopRequest[];
}


/* ============================================================
   DELIVERY REQUEST MODELS
   ============================================================ */

export interface CreateDeliveryRequest {
  shipmentId: number;

  driverId: number;
  vehicleId: number;
  routeId: number;
}


export interface UpdateDeliveryRequest {
  shipmentId: number;

  driverId: number;
  vehicleId: number;
  routeId: number;

  status?: DeliveryStatus;
}


export interface PickupConfirmationRequest {
  deliveryId: number;
}


export interface DeliveryFailureRequest {
  deliveryId: number;

  reason: string;
}


export interface CreateProofOfDeliveryRequest {
  deliveryId: number;

  receiverName: string;

  receiverContact?: string | null;

  signaturePath?: string | null;

  photoPath?: string | null;

  remarks?: string | null;
}


/* ============================================================
   SCHEDULE REQUEST MODELS
   ============================================================ */

export interface CreateScheduleRequest {
  type: ScheduleType;

  shipmentId?: number | null;

  routeId?: number | null;

  driverId: number;
  vehicleId: number;

  startTime: string;
  endTime: string;

  notes?: string | null;
}


export interface UpdateScheduleRequest {
  type: ScheduleType;

  shipmentId?: number | null;

  routeId?: number | null;

  driverId: number;
  vehicleId: number;

  startTime: string;
  endTime: string;

  notes?: string | null;

  status?: ScheduleStatus;
}


export interface RescheduleRequest {
  startTime: string;
  endTime: string;
}


export interface CancelScheduleRequest {
  reason?: string | null;
}


/* ============================================================
   API / VALIDATION MODELS
   ============================================================ */

export interface ApiError {
  message: string;

  errors?: {
    [key: string]: string[];
  };
}


export interface ValidationResult {
  valid: boolean;

  message?: string;

  errors?: string[];
}


/* ============================================================
   DASHBOARD / SUMMARY MODELS
   ============================================================ */

export interface DeliverySummary {
  total: number;

  pending: number;

  pickupConfirmed: number;

  outForDelivery: number;

  completed: number;

  failed: number;
}


export interface ScheduleSummary {
  total: number;

  scheduled: number;

  rescheduled: number;

  cancelled: number;

  completed: number;
}