import { Injectable } from '@angular/core';
import { FriendsRequestService } from '../services/friends-request.service';
import { MessageService } from './message.service';
import { MessageType } from '../models/enums/MessageType';
import {BehaviorSubject, tap} from 'rxjs';
import {FriendRequest} from "../models/FriendRequest";
import {FriendsListHandlerService} from "./friends-list-handler.service";
import {ToastrService} from "ngx-toastr";
import {NotificationHandlerService} from "./notification-handler.service";

@Injectable({
  providedIn: 'root'
})
export class FriendRequestHandlerService {
  private requestsListSubject = new BehaviorSubject<FriendRequest[]>([]);
  requestsList$ = this.requestsListSubject.asObservable();

  private sentRequestsSubject = new BehaviorSubject<FriendRequest[]>([]);
  sentRequests$ = this.sentRequestsSubject.asObservable();

  constructor(
    private friendsListHandlerService: FriendsListHandlerService,
    private friendsRequestService: FriendsRequestService,
    private notificationHandlerService: NotificationHandlerService,
    private toastr: ToastrService
  ) {}

  loadReceivedRequests() {
    return this.friendsRequestService.getReceivedRequests().pipe(
      tap(requests => {
        const uniqueRequests = Array.from(
          new Set(requests.map(request => request.id))
        ).map(id => requests.find(request => request.id === id));

        this.requestsListSubject.next(requests);
      })
    );
  }

  handleMessage(message: any) {
    switch (message.messageType) {
      case MessageType.FRIEND_REQUEST_ACCEPTED:
        this.friendsListHandlerService.addNewFriend(message.senderId);
        break;
      case MessageType.FRIEND_REQUEST:
        this.handleFriendRequest(message.senderId, message.receiverId);
        break;
      case MessageType.FRIEND_REQUEST_CANCELED:
        this.handleFriendRequestCanceled(message.senderId, message.receiverId);
        break;
    }
  }

  removeRequest(request: FriendRequest) {
    const currentList = this.requestsListSubject.getValue();
    const updatedList = currentList.filter(req =>
      req.sender.connectionId !== request.sender.connectionId
      || req.receiver.connectionId !== request.receiver.connectionId
    );
    this.requestsListSubject.next(updatedList);
  }

  private handleFriendRequest(senderId: string, receiverId: string) {
    console.log(this.requestsListSubject.getValue())
    this.friendsRequestService.getReceivedRequestIds(senderId, receiverId).subscribe({
      next: (response) => {
        const currentList = this.requestsListSubject.getValue();
        const isDuplicate = currentList.some(
          (req) => response.sender.connectionId === req.sender.connectionId &&
            response.receiver.connectionId === req.receiver.connectionId
        );

        if (!isDuplicate) {
          this.requestsListSubject.next([...currentList, response]);
        }
      },
      error: (error) => {
        console.error('Error fetching friend request:', error.message, error);
      }
    });
  }

  private handleFriendRequestCanceled(senderId: string, receiverId: string) {
    const currentList = this.requestsListSubject.getValue();
    const updatedList = currentList.filter(req =>
      req.sender.connectionId !== senderId || req.receiver.connectionId !== receiverId
    );
    this.requestsListSubject.next(updatedList);
  }

  handleNotificationMessage(message: any) {
    let receivedRequests = this.requestsListSubject.getValue();
    let sentRequests = this.sentRequestsSubject.getValue();

    switch (message.messageType) {
      case MessageType.FRIEND_REQUEST:
        this.addFriendRequest(receivedRequests, message);
        break;

      case MessageType.FRIEND_REQUEST_ACCEPTED:
        this.toastr.info(`${message.senderUsername} accepted your friend request`, 'Accepted friend request');
        this.notificationHandlerService.removeUnseenRequest(message.receiverId, message.senderId);
        break;

      case MessageType.FRIEND_REQUEST_DECLINED:
        this.notificationHandlerService.removeUnseenRequest(message.receiverId, message.senderId);
        this.removeDeclinedFriendRequest(sentRequests, message);
        break;

      case MessageType.FRIEND_REQUEST_CANCELED:
        this.removeCanceledFriendRequest(receivedRequests, message);
        break;
    }
  }

  addFriendRequest(receivedRequests: FriendRequest[], message: any) {
    const friendRequest: FriendRequest = {
      id: 0,
      sender: {
        connectionId: message.senderId,
        connectionUsername: message.senderUsername,
        convId: '',
        unSeen: '0',
        avatar: ''
      },
      receiver: {
        connectionId: message.receiverId,
        connectionUsername: message.receiverUsername,
        convId: '',
        unSeen: '0',
        avatar: ''

      },
      createdDate: new Date(),
      deliveryStatus: ''
    };

    this.requestsListSubject.next([...receivedRequests, friendRequest])
  }

  removeDeclinedFriendRequest(sentRequests: FriendRequest[], message: any){
    this.sentRequestsSubject.next(sentRequests.filter((req) => req.receiver.connectionId !== message.senderId));
  }

  removeCanceledFriendRequest(receivedRequests: FriendRequest[], message: any) {
    this.requestsListSubject.next(receivedRequests.filter((req) => req.sender.connectionId !== message.senderId));
  }

  setReceivedRequests(receivedRequest: FriendRequest[]) {
    this.requestsListSubject.next(receivedRequest);
  }

  setSentRequests(sentRequests: FriendRequest[]) {
    this.sentRequestsSubject.next(sentRequests);
  }

  getReceivedRequests(): FriendRequest[]{
    return this.requestsListSubject.getValue();
  }

  getSentRequests(): FriendRequest[] {
    return this.sentRequestsSubject.getValue();
  }
}
