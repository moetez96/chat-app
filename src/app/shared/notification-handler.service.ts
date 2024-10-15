import { Injectable } from '@angular/core';
import {SimpleNotif} from "../models/SimpleNotif";
import {BehaviorSubject} from "rxjs";
import {NotificationType} from "../models/enums/NotificationType";
import {MessageType} from "../models/enums/MessageType";
import {MessageDeliveryStatusEnum} from "../models/enums/MessageDeliveryStatusEnum";
import {ChatMessage} from "../models/ChatMessage";
import {AuthService} from "../services/auth.service";
import {ToastrService} from "ngx-toastr";
import {FriendRequest} from "../models/FriendRequest";

@Injectable({
  providedIn: 'root'
})
export class NotificationHandlerService {
  private unseenMessagesSubject = new BehaviorSubject<SimpleNotif[]>([]);
  unseenMessages$  = this.unseenMessagesSubject.asObservable();
  private unseenRequestsSubject = new BehaviorSubject<SimpleNotif[]>([]);
  unseenRequests$  = this.unseenRequestsSubject.asObservable();

  constructor(private authService: AuthService, private toastr: ToastrService) {
  }

  addUnseenMessage(message: SimpleNotif): void {
    const unseenMessages = this.unseenMessagesSubject.getValue();

    const isDuplicate = unseenMessages.some(
      (msg) => msg.senderId === message.senderId && msg.receiverId === message.receiverId
    );

    if (!isDuplicate) {
      this.unseenMessagesSubject.next([...unseenMessages, message]);
    }
  }

  addUnseenRequest(request: SimpleNotif): void {
    const unseenRequests = this.unseenRequestsSubject.getValue();
    const isDuplicate = unseenRequests.some(
      (req) => req.senderId === request.senderId && req.receiverId === request.receiverId
    );
    if (!isDuplicate) {
      this.unseenRequestsSubject.next([...unseenRequests, request]);
    }
  }

  setUnseenRequest(requests: FriendRequest[]): void {
    const requestNotifs = requests.map((req) => ({
      senderId: req.sender.connectionId,
      senderUsername: req.sender.connectionUsername,
      receiverId: req.receiver.connectionId,
      receiverUsername: req.receiver.connectionUsername,
      notificationType: NotificationType.REQUEST
    }));

    this.unseenRequestsSubject.next(requestNotifs);
  }

  removeUnseenRequest(senderId: string, receiverId: string): void {
    const updatedRequests = this.unseenRequestsSubject.getValue()
      .filter(req => !(req.senderId === senderId && req.receiverId === receiverId));
    this.unseenRequestsSubject.next(updatedRequests);
  }

  resetUnseenRequest(): void {
    const emptyRequests: SimpleNotif[] = [];
    this.unseenRequestsSubject.next(emptyRequests);
  }

  resetUnseenMessages(): void {
    const emptyMessages: SimpleNotif[] = [];
    this.unseenMessagesSubject.next(emptyMessages);
  }

  handleMessageNotifications(message: ChatMessage) {
    const simpleNotif: SimpleNotif = {
      senderId: message.senderId,
      senderUsername: message.senderUsername,
      receiverId: message.receiverId,
      receiverUsername: message.receiverUsername,
      notificationType: NotificationType.REQUEST
    };

    if (message.messageType === MessageType.FRIEND_REQUEST) {
      this.toastr.info(`${message.senderUsername} sent you a friend request`, 'New friend request');
      this.addUnseenRequest(simpleNotif);
    }

    if (message.messageType === MessageType.FRIEND_REQUEST_CANCELED) {
      this.removeUnseenRequest(message.senderId, message.receiverId);
    }

    if ((message.messageDeliveryStatusEnum === MessageDeliveryStatusEnum.DELIVERED || message.messageType === MessageType.UNSEEN)
      && message.senderId !== this.authService.getCurrentUser()?.id) {

      simpleNotif.notificationType = NotificationType.MESSAGE;
      this.addUnseenMessage(simpleNotif);
    }
  }

}
