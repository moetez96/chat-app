import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd } from "@angular/router";
import { WebSocketService } from "./socket/WebSocketService";
import { AuthService } from "./services/auth.service";
import { MessageService } from "./shared/message.service";
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
    this.pollingService.isServerReady$.subscribe(isReady => {
      this.isServerReady = isReady;
        if (!isReady) {
          this.pollingService.startPolling();
        } else {
          if (!this.isOnLoginOrRegisterRoute() && this.authService.isLoggedIn()) {
            this.webSocketService.subscribeToWebSocket();
          }
        }
    });

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.showNavbar = !this.isOnLoginOrRegisterRoute();

        if (!this.isOnLoginOrRegisterRoute() && this.authService.isLoggedIn()) {
          this.webSocketService.subscribeToWebSocket();
        }
      });
  }

  private isOnLoginOrRegisterRoute(): boolean {
    const currentUrl = this.router.url;
    return currentUrl === '/login' || currentUrl === '/register';
  }

  ngOnDestroy() {
    this.pollingService.stopPolling();
    this.webSocketService.disconnect();
  }
}
