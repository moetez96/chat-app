import { Injectable } from '@angular/core';
import { FriendsRequestService } from '../services/friends-request.service';
import { MessageService } from './message.service';
import { MessageType } from '../models/enums/MessageType';
import {BehaviorSubject, tap} from 'rxjs';
import {FriendRequest} from "../models/FriendRequest";

@Injectable({
  providedIn: 'root'
})
export class FriendRequestHandlerService {
  private requestsListSubject = new BehaviorSubject<FriendRequest[]>([]);
  requestsList$ = this.requestsListSubject.asObservable();

  constructor(
    private friendsRequestService: FriendsRequestService,
    private messageService: MessageService
  ) {}

  loadReceivedRequests() {
    return this.friendsRequestService.getReceivedRequests().pipe(
      tap(requests => {
        const uniqueRequests = Array.from(
          new Set(requests.map(request => request.id))
        ).map(id => requests.find(request => request.id === id));

        console.log(requests);
        console.log(uniqueRequests);

        this.requestsListSubject.next(requests);
      })
    );
  }

  handleMessage(message: any) {
    console.log(message);
    switch (message.messageType) {
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
          currentList.push(response);
          this.requestsListSubject.next(currentList);
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
}
