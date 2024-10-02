import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {SignupRequest} from "../models/SignupRequest";
import {map, Observable} from "rxjs";
import {AuthService} from "./auth.service";
import {Friend} from "../models/Friend";
import {ChatMessage} from "../models/ChatMessage";
import {ApiResponse} from "../models/ApiResponse";
import {FriendRequest} from "../models/FriendRequest";
import {handleError, handleResponse} from "../utils/api-handler";
import {catchError} from "rxjs/operators";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class FriendsService {

  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getAllContacts(): Observable<Friend[]> {

    return this.http.get<ApiResponse<Friend[]>>(`${this.apiUrl}contact/getAllContacts`)
      .pipe(
        map(response =>handleResponse(response)),
        catchError(error => handleError(error))
      );
  }

  getFriends(): Observable<Friend[]> {

    return this.http.get<ApiResponse<Friend[]>>(`${this.apiUrl}contact/friends`)
      .pipe(
        map(response =>handleResponse(response)),
        catchError(error => handleError(error))
      );
  }

  getFriendById(friendId: string): Observable<Friend> {

    return this.http.get<ApiResponse<Friend>>(`${this.apiUrl}contact/friend/${friendId}`)
      .pipe(
        map(response =>handleResponse(response)),
        catchError(error => handleError(error))
      );
  }

  getUnseenMessages(): Observable<ChatMessage[]> {

    return this.http.get<ApiResponse<ChatMessage[]>>(`${this.apiUrl}conversation/unseenMessages`)
      .pipe(
        map(response =>handleResponse(response)),
        catchError(error => handleError(error))
      );
  }

  getLastMessage(convId: string): Observable<ChatMessage> {

    return this.http.get<ApiResponse<ChatMessage>>(`${this.apiUrl}conversation/getLastMessage/${convId}`)
      .pipe(
        map(response =>handleResponse(response)),
        catchError(error => handleError(error))
      );
  }

}
