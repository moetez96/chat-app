import { Injectable } from '@angular/core';
import {map, Observable} from "rxjs";
import { HttpClient } from "@angular/common/http";
import { FriendRequest } from "../models/FriendRequest";
import {catchError, tap} from "rxjs/operators";
import { environment } from "../../environments/environment";
import {ApiResponse} from "../models/ApiResponse";
import {handleError, handleResponse} from "../utils/api-handler";
import {ToastrService} from "ngx-toastr";

@Injectable({
  providedIn: 'root'
})
export class FriendsRequestService {

  private apiUrl = `${environment.apiUrl}request/`;

  constructor(private http: HttpClient,
              private toastr: ToastrService) {}

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
        catchError(error => {
          this.toastr.error('Error fetching requests', 'Server error');
          return handleError(error)
        })
      );
  }

  getReceivedRequestIds(senderId: string, receiverId: string): Observable<FriendRequest> {
    return this.http.get<ApiResponse<FriendRequest>>(`${this.apiUrl}getReceivedRequestIds/${senderId}/${receiverId}`)
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
        tap(response => response),
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

  getReceivedUnseenRequests(): Observable<FriendRequest[]> {
    return this.http.get<ApiResponse<FriendRequest[]>>(`${this.apiUrl}getReceivedUnseenRequests`)
      .pipe(
        map(response =>handleResponse(response)),
        catchError(error => handleError(error))
      );
  }

  seeFriendsRequests(): Observable<any> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}seeFriendsRequests`, {})
      .pipe(
        tap(response => console.log('API response:', response)),
        map(response => handleResponse(response)),
        catchError(error => handleError(error))
      );
  }

}
