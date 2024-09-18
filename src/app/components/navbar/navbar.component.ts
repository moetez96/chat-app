import { Component } from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {WebSocketService} from "../../socket/WebSocketService";
import {Router} from "@angular/router";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  constructor(private authService: AuthService, private webSocketService: WebSocketService, private router: Router) {
  }
  handleLogout() {
    this.authService.logout();
    this.webSocketService.disconnect();
    window.location.reload();
  }

  isMessengerUrl() {
    return this.router.url === '/messenger';
  }

  isContactsUrl() {
    return this.router.url === '/contacts';
  }
}
