import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from "@angular/router";
import { WebSocketService } from "./socket/WebSocketService";
import { AuthService } from "./services/auth.service";
import { IMessage } from "@stomp/stompjs";
import { ChatMessage } from './models/ChatMessage';
import { MessageService } from "./shared/message.service";
import { environment } from "../environments/environment";
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  showNavbar = true;
  private userId: string | null = null;

  constructor(
    private router: Router,
    private webSocketService: WebSocketService,
    private authService: AuthService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.showNavbar = !(event.url === '/login' || event.url === '/register');

        if (this.authService.isLoggedIn()) {
          const currentUserId = this.authService.getCurrentUser()?.id;

          if (currentUserId && currentUserId !== this.userId) {
            this.userId = currentUserId;
            this.subscribeToWebSocket(this.userId);
          }
        } else {
          this.userId = null;
          this.webSocketService.disconnect();
        }
      });
  }

  private subscribeToWebSocket(userId: string) {
    const token = this.authService.getToken();
    const url = environment.wsUrl;

    this.webSocketService.connect(url, token);
    this.webSocketService.subscribe(`/topic/${userId}`, (message: IMessage) => {
      const messageBody: ChatMessage = JSON.parse(message.body);
      this.messageService.setMessage(messageBody);
    });
  }

  ngOnDestroy() {
    this.webSocketService.disconnect();
  }
}
