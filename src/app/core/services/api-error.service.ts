import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ApiErrorService {
  message(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const body = error.error as unknown;
      if (typeof body === 'string' && body.trim()) return body;
      if (body && typeof body === 'object') {
        const record = body as Record<string, unknown>;
        if (typeof record['message'] === 'string') return record['message'];
        if (typeof record['title'] === 'string') return record['title'];
        const errors = record['errors'];
        if (errors && typeof errors === 'object') {
          const messages = Object.values(errors as Record<string, unknown>).flatMap(v =>
            Array.isArray(v) ? v.map(String) : [String(v)]);
          if (messages.length) return messages.join(' ');
        }
      }
      if (error.status === 0) return 'Cannot connect to the LogiFlow API. Start the backend and try again.';
      if (error.status === 401) return 'Your session has expired. Please sign in again.';
      if (error.status === 403) return 'You do not have permission to perform this action.';
      if (error.status === 404) return 'The requested resource was not found.';
      return `Request failed (${error.status}). Please try again.`;
    }
    return 'An unexpected error occurred.';
  }
}
