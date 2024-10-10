import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd } from "@angular/router";
import { WebSocketService } from "./socket/WebSocketService";
import { AuthService } from "./services/auth.service";
import { IMessage } from "@stomp/stompjs";
import { ChatMessage } from './models/ChatMessage';
import { MessageService } from "./shared/message.service";
import { environment } from "../environments/environment";
import { filter } from 'rxjs/operators';
import {PollingService} from "./shared/polling.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  showNavbar = true;
  isServerReady = false;

  constructor(
    private router: Router,
    private webSocketService: WebSocketService,
    private authService: AuthService,
    private messageService: MessageService,
    private pollingService: PollingService
  ) {}

  ngOnInit(): void {
    this.pollingService.startPolling();

    this.pollingService.isServerReady$.subscribe(isReady => {
      this.isServerReady = isReady;

      if (isReady && this.authService.isLoggedIn()) {
        this.webSocketService.subscribeToWebSocket();
      }
    });

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.showNavbar = !(event.url === '/login' || event.url === '/register');

        if (this.authService.isLoggedIn() && this.isServerReady) {
          this.webSocketService.subscribeToWebSocket();
        } else {
          this.webSocketService.disconnect();
        }
      });
  }

  ngOnDestroy() {
    this.pollingService.stopPolling();
    this.webSocketService.disconnect();
  }
}
