import { Injectable } from '@angular/core';
import {map, Observable, throwError} from "rxjs";
import { HttpClient } from "@angular/common/http";
import { FriendRequest } from "../models/FriendRequest";
import {catchError, tap} from "rxjs/operators";
import { environment } from "../../environments/environment";
import {ApiResponse} from "../models/ApiResponse";
import {handleError, handleResponse} from "../utils/api-handler";

@Injectable({
  providedIn: 'root'
})
export class FriendsRequestService {

  private apiUrl = `${environment.apiUrl}/api/request/`;

  constructor(private http: HttpClient) {}

  sendRequest(friendId: string): Observable<FriendRequest> {
    return this.http.post<ApiResponse<FriendRequest>>(`${this.apiUrl}addFriendRequest/${friendId}`, {})
      .pipe(
        map(response => handleResponse(response)),
        catchError(error => handleError(error))
      );
  }

  getSentRequests(): Observable<FriendRequest[]> {
    return this.http.get<ApiResponse<FriendRequest[]>>(`${this.apiUrl}getSentRequests`)
      .pipe(
        map(response => handleResponse(response)),
        catchError(error => handleError(error))
      );
  }

  getReceivedRequests(): Observable<FriendRequest[]> {
    return this.http.get<ApiResponse<FriendRequest[]>>(`${this.apiUrl}getReceivedRequests`)
      .pipe(
        map(response =>handleResponse(response)),
        catchError(error => handleError(error))
      );
  }

  acceptFriendRequest(senderId: string): Observable<any> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}acceptFriendRequest/${senderId}`, {})
      .pipe(
        tap(response => console.log('API response:', response)),
        map(response => handleResponse(response)),
        catchError(error => handleError(error))
      );
  }

  declineFriendRequest(senderId: string): Observable<any> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}declineFriendRequest/${senderId}`, {})
      .pipe(
        tap(response => console.log('API response:', response)),
        map(response => handleResponse(response)),
        catchError(error => handleError(error))
      );
  }

  cancelFriendRequest(receiverId: string): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}cancelFriendRequest/${receiverId}`)
      .pipe(
        map(response => handleResponse(response)),
        catchError(error => handleError(error))
      );
  }

}
