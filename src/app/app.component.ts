import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from "@angular/router";
import { WebSocketService } from "./socket/WebSocketService";
import { AuthService } from "./services/auth.service";
import { IMessage } from "@stomp/stompjs";
import { ChatMessage } from './models/ChatMessage';
import { MessageService } from "./shared/message.service";
import { environment } from "../environments/environment";
import { filter, switchMap, takeUntil, catchError } from 'rxjs/operators';
import { interval, Subject, throwError } from "rxjs";
import { ServerStatusService } from "./services/server-status.service";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  showNavbar = true;
  private userId: string | null = null;

  isServerReady = false;
  private stopPolling$ = new Subject<void>();
  private loadingToastId: number | null = null;

  constructor(
    private router: Router,
    private webSocketService: WebSocketService,
    private authService: AuthService,
    private messageService: MessageService,
    private serverStatusService: ServerStatusService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.startPolling();

    this.loadingToastId = this.toastr.info('Awaiting backend connection please wait', 'Loading', {
      disableTimeOut: true,
      closeButton: true
    }).toastId;

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

  startPolling() {
    interval(5000)
      .pipe(
        switchMap(() => this.serverStatusService.checkServerStatus()),
        takeUntil(this.stopPolling$),
        catchError(error => {
          this.toastr.error('Failed to connect to the backend.', 'Error');
          this.stopPolling$.next();
          return throwError(() => new Error(error));
        })
      )
      .subscribe(isReady => {
        if (isReady) {
          this.isServerReady = true;
          console.log('Server is ready!');

          if (this.loadingToastId !== null) {
            this.toastr.clear(this.loadingToastId);
          }

          this.toastr.success('Backend is ready', 'Success');

          this.stopPolling$.next();
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
    this.stopPolling$.next();
    this.stopPolling$.complete();
  }
}
