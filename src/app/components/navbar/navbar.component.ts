import { Component, OnInit } from '@angular/core';
import { AuthService } from "../../services/auth.service";
import { WebSocketService } from "../../socket/WebSocketService";
import { Router } from "@angular/router";
import { MessageService } from "../../services/message.service";
import { MessageType } from "../../models/enums/MessageType";
import {SimpleNotif} from "../../models/SimpleNotif";
import {NotificationType} from "../../models/enums/NotificationType";
import {FriendsRequestService} from "../../services/friends-request.service";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  constructor(private authService: AuthService,
              private friendsRequestService: FriendsRequestService,
              private webSocketService: WebSocketService,
              private router: Router,
              private messageService: MessageService) {
  }

  ngOnInit(): void {

    this.friendsRequestService.getReceivedUnseenRequests().subscribe({
      next: (requests) => {
        this.messageService.setUnseenRequest(
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

    this.messageService.message$.subscribe(message => {
      if (message) {

        const simpleNotif: SimpleNotif = {
          senderId: message.senderId,
          senderUsername: message.senderUsername,
          receiverId: message.receiverId,
          receiverUsername: message.receiverUsername,
          notificationType: NotificationType.REQUEST
        }

        if (message.messageType === MessageType.FRIEND_REQUEST) {
          this.messageService.addUnseenRequest(simpleNotif);
        }

        if (message.messageType === MessageType.FRIEND_REQUEST_CANCELED) {
          this.messageService.removeUnseenRequest(message.senderId, message.receiverId);
        }
      }

    });
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

  get unseenRequestsCount(): number {
    return this.messageService.getUnseenRequests().length;
  }

  get unseenMessagesCount(): number {
    return this.messageService.getUnseenMessages().length;
  }

}
