import { Observable, throwError } from 'rxjs';
import {ApiResponse} from "../models/ApiResponse";

export function handleResponse<T>(response: ApiResponse<T>): T {
  if (response.status === 'success') {
    return response.data;
  } else {
    throw new Error(response.message);
  }
}

export function handleError(error: any): Observable<never> {
  console.error('API error occurred:', error);
  return throwError(error.message || 'Server error');
}
