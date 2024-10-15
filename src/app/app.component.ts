import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd } from "@angular/router";
import { WebSocketService } from "./socket/WebSocketService";
import { AuthService } from "./services/auth.service";
import { MessageService } from "./shared/message.service";
import { filter } from 'rxjs/operators';
import { PollingService } from "./shared/polling.service";
import {debounceTime, Subscription} from 'rxjs';
import {FriendRequestHandlerService} from "./shared/friend-request-handler.service";
import {FriendsListHandlerService} from "./shared/friends-list-handler.service";
import {ContactsHandlerService} from "./shared/contacts-handler.service";
import {NotificationHandlerService} from "./shared/notification-handler.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  showNavbar = true;
  isServerReady = false;

  private routerSubscription!: Subscription;
  private serverReadySubscription!: Subscription;
  private messageSubscription!: Subscription;

  constructor(
    private router: Router,
    private webSocketService: WebSocketService,
    private authService: AuthService,
    private messageService: MessageService,
    private pollingService: PollingService,
    private friendRequestHandlerService: FriendRequestHandlerService,
    private friendsListHandlerService: FriendsListHandlerService,
    private contactsHandlerService: ContactsHandlerService,
    private notificationHandlerService: NotificationHandlerService
  ) {}

  ngOnInit(): void {
    this.serverReadySubscription = this.pollingService.isServerReady$.subscribe(isReady => {
      this.isServerReady = isReady;
      if (!isReady) {
        this.pollingService.startPolling();
      } else {
        this.tryWebSocketConnection();
      }
    });

    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const isLoginOrRegister = this.isOnLoginOrRegisterRoute();
        this.showNavbar = !isLoginOrRegister;

        this.tryWebSocketConnection();
      });

    this.messageSubscription = this.messageService.message$.pipe(debounceTime(100)).subscribe(message => {
      if (message) {
        console.log(message);
        this.friendRequestHandlerService.handleMessage(message);
        this.friendsListHandlerService.handleIncomingMessage(message);
        this.notificationHandlerService.handleMessageNotifications(message);
        this.friendRequestHandlerService.handleNotificationMessage(message);
        this.contactsHandlerService.handleContactsMessage(message);
      }
    });
  }

  private tryWebSocketConnection(): void {
    if (!this.isOnLoginOrRegisterRoute() && this.authService.isLoggedIn()) {
      this.webSocketService.subscribeToWebSocket();
    }
  }

  private isOnLoginOrRegisterRoute(): boolean {
    const currentUrl = this.router.url;
    return currentUrl === '/login' || currentUrl === '/register';
  }

  ngOnDestroy() {
    if (this.serverReadySubscription) {
      this.serverReadySubscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    this.pollingService.stopPolling();
    this.webSocketService.disconnect();
  }
}
