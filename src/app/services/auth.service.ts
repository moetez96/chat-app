import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, tap} from 'rxjs';
import {SignupRequest} from '../models/SignupRequest';
import {LoginRequest} from '../models/LoginRequest';
import {JwtHelperService} from '@auth0/angular-jwt';
import {CurrentUser} from '../models/CurrentUser';
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  register(signupRequest: SignupRequest): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.post(`${this.apiUrl}auth/register`, signupRequest, { headers });
  }

  login(loginRequest: LoginRequest): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.post(`${this.apiUrl}auth/login`, loginRequest, { headers }).pipe(
      tap((response: any) => {
        if (response && response.token) {
          localStorage.setItem('jwt_token', response.token);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('jwt_token');
  }

  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  getCurrentUser(): CurrentUser | null {
    try {
      const token = this.getToken();
      if (!token) {
        return null;
      }

      if (this.isTokenExpired()) {
        return null;
      }

      const jwtHelper = new JwtHelperService();
      const decodedToken = jwtHelper.decodeToken(token);

      return {
        id: decodedToken.jti,
        username: decodedToken.sub,
      };
    } catch (Error) {
      return null;
    }
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token;
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) {
      return true;
    }
    const jwtHelper = new JwtHelperService();
    const expirationDate = jwtHelper.getTokenExpirationDate(token);
    const isExpired = jwtHelper.isTokenExpired(token);

    if (expirationDate) {
      const timeRemaining = expirationDate.getTime() - new Date().getTime();
      //console.log(`Token will expire in ${timeRemaining / 1000} seconds.`);
    } else {
      console.log('Token expiration date not found.');
    }

    return isExpired;
  }
}
