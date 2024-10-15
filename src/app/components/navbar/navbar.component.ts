import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from "../../services/auth.service";
import { WebSocketService } from "../../socket/WebSocketService";
import { Router } from "@angular/router";
import { MessageService } from "../../shared/message.service";
import { FriendsRequestService } from "../../services/friends-request.service";
import { NotificationHandlerService } from "../../shared/notification-handler.service";
import { Subscription} from 'rxjs';
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription = new Subscription();

  unseenRequestsCount: number = 0;
  unseenMessagesCount: number = 0;

  constructor(private authService: AuthService,
              private friendsRequestService: FriendsRequestService,
              private webSocketService: WebSocketService,
              private router: Router,
              private messageService: MessageService,
              private notificationHandlerService: NotificationHandlerService) { }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {

      const requestsSubscription = this.friendsRequestService.getReceivedUnseenRequests().subscribe({
        next: (requests) => {
          this.notificationHandlerService.setUnseenRequest(requests);
        },
        error: (err) => console.log(err),
      });

      const unseenMessagesSubscription = this.notificationHandlerService.unseenMessages$.subscribe(unseen => {
        this.unseenMessagesCount = unseen.length;
      });

      const unseenRequestsSubscription = this.notificationHandlerService.unseenRequests$.subscribe(unseen => {
        this.unseenRequestsCount = unseen.length;
      });

      this.subscriptions.add(requestsSubscription);
      this.subscriptions.add(unseenMessagesSubscription);
      this.subscriptions.add(unseenRequestsSubscription);

    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  handleLogout() {
    this.authService.logout();
    this.webSocketService.disconnect();
    window.location.reload();
  }

  isMessengerUrl(): boolean {
    return this.router.url === '/messenger';
  }

  isContactsUrl(): boolean {
    return this.router.url === '/contacts';
  }

}
