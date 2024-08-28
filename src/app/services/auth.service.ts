import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SignupRequest } from "../models/SignupRequest";
import {LoginRequest} from "../models/LoginRequest";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/';

  constructor(private http: HttpClient) {}

  register(signupRequest: SignupRequest): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post(`${this.apiUrl}auth/register`, signupRequest, { headers });
  }

  login(loginRequest: LoginRequest): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post(`${this.apiUrl}auth/login`, loginRequest, { headers });
  }
}
