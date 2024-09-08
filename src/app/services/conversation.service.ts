import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {AuthService} from "./auth.service";
import {Observable} from "rxjs";
import {Friend} from "../models/Friend";
import {ChatMessage} from "../models/ChatMessage";

@Injectable({
  providedIn: 'root'
})
export class ConversationService {

  private apiUrl = 'http://localhost:8080/api/';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getConversationMessages(convId: string): Observable<ChatMessage[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });

    return this.http.get<ChatMessage[]>(`${this.apiUrl}conversation/getConversationMessages/${convId}`, { headers });
  }
}
