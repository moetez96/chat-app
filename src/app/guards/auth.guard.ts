import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import {AuthService} from "../services/auth.service";
import {WebSocketService} from "../socket/WebSocketService";

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService,
              private router: Router,
              private webSocketService: WebSocketService) {}

  canActivate(): boolean {
    if (this.authService.isLoggedIn() && !this.authService.isTokenExpired()) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
