import { Component } from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {WebSocketService} from "../../socket/WebSocketService";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  constructor(private authService: AuthService, private webSocketService: WebSocketService) {
  }
  handleLogout() {
    this.authService.logout();
    this.webSocketService.disconnect();
    window.location.reload();
  }
}
