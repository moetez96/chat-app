import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {AuthService} from "./auth.service";
import {FriendRequest} from "../models/FriendRequest";

@Injectable({
  providedIn: 'root'
})
export class FriendsRequestService {

  private apiUrl = 'http://localhost:8080/api/';

  constructor(private http: HttpClient, private authService: AuthService) {

  }

  sendRequest(friendId: string): Observable<FriendRequest | any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });

    return this.http.post<FriendRequest | any>(`${this.apiUrl}request/addFriendRequest/${friendId}`, {}, { headers });
  }


}
