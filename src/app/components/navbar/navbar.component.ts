import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from "../../services/auth.service";
import { WebSocketService } from "../../socket/WebSocketService";
import { Router } from "@angular/router";
import { MessageService } from "../../shared/message.service";
import { NotificationType } from "../../models/enums/NotificationType";
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
          this.notificationHandlerService.setUnseenRequest(
            requests.map((req) => ({
              senderId: req.sender.connectionId,
              senderUsername: req.sender.connectionUsername,
              receiverId: req.receiver.connectionId,
              receiverUsername: req.receiver.connectionUsername,
              notificationType: NotificationType.REQUEST
            }))
          );
        },
        error: (err) => console.log(err),
      });

      this.subscriptions.add(requestsSubscription);

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

  get unseenRequestsCount(): number {
    return this.notificationHandlerService.getUnseenRequests().length;
  }

  get unseenMessagesCount(): number {
    return this.notificationHandlerService.getUnseenMessages().length;
  }
}
