import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {SignupRequest} from "../models/SignupRequest";
import {Observable} from "rxjs";
import {AuthService} from "./auth.service";
import {Friend} from "../models/Friend";
import {ChatMessage} from "../models/ChatMessage";

@Injectable({
  providedIn: 'root'
})
export class FriendsService {

  private apiUrl = 'http://localhost:8080/api/';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getAllContacts(): Observable<Friend[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });

    return this.http.get<Friend[]>(`${this.apiUrl}contact/getAllContacts`, { headers });
  }

  getFriends(): Observable<Friend[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });

    return this.http.get<Friend[]>(`${this.apiUrl}contact/friends`, { headers });
  }

  getUnseenMessages(): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });

    return this.http.get(`${this.apiUrl}conversation/unseenMessages`, { headers });
  }

  getLastMessage(convId: string): Observable<ChatMessage> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });

    return this.http.get<ChatMessage>(`${this.apiUrl}conversation/getLastMessage/${convId}`, { headers });
  }

}
