import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {AuthService} from "./auth.service";
import {map, Observable} from "rxjs";
import {ChatMessage} from "../models/ChatMessage";
import {environment} from "../../environments/environment";
import {ApiResponse} from "../models/ApiResponse";
import {handleError, handleResponse} from "../utils/api-handler";
import {catchError} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class ConversationService {

  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  getConversationMessages(convId: string): Observable<ChatMessage[]> {

    return this.http.get<ApiResponse<ChatMessage[]>>(`${this.apiUrl}conversation/getConversationMessages/${convId}`)
      .pipe(
        map(response =>handleResponse(response)),
        catchError(error => handleError(error))
      );
  }

  setReadMessages(chatMessages: ChatMessage[]): Observable<ChatMessage[]> {

    return this.http.put<ApiResponse<ChatMessage[]>>(`${this.apiUrl}conversation/setReadMessages`, chatMessages)
      .pipe(
        map(response =>handleResponse(response)),
        catchError(error => handleError(error))
      );
  }

}
