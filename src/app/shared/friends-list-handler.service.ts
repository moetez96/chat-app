import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable, tap } from 'rxjs';
import { Friend } from '../models/Friend';
import { FriendsService } from '../services/friends.service';
import { ChatMessage } from '../models/ChatMessage';
import { MessageType } from '../models/enums/MessageType';
import { MessageDeliveryStatusEnum } from '../models/enums/MessageDeliveryStatusEnum';
import {MessageService} from "./message.service";

@Injectable({
  providedIn: 'root'
})
export class FriendsListHandlerService {

  private friendsListSubject = new BehaviorSubject<Friend[]>([]);
  friendsList$ = this.friendsListSubject.asObservable();

  constructor(
    private friendsService: FriendsService,
    private messageService: MessageService
  ) {}

  loadFriendsAndUnseenMessages(): void {
    forkJoin({
      friends: this.friendsService.getFriends(),
      unseenMessages: this.friendsService.getUnseenMessages()
    }).subscribe({
      next: ({ friends, unseenMessages }) => {

        if (unseenMessages && unseenMessages.length > 0) {
          unseenMessages.forEach((u: any) => {
            const friend = friends.find(f => f.connectionId === u.fromUser);
            if (friend) {
              friend.unSeen = u.count;
            }
          });
        }
        this.friendsListSubject.next(friends.map(friend => {
          this.loadLastMessage(friend).subscribe({
            error: (error) => console.log(error)
          });
          return friend;
        }));
      },
      error: (error) => console.error('Error fetching friends:', error)
    });
  }

  loadLastMessage(friend: Friend): Observable<ChatMessage> {
    return this.friendsService.getLastMessage(friend.convId).pipe(
      tap((message: ChatMessage) => {
        friend.lastMessage = message;
      })
    );
  }

  handleIncomingMessage(message: ChatMessage): void {
    const updatedFriendsList = this.friendsListSubject.value.map((friend) => {
      if (message.messageType === MessageType.FRIEND_ONLINE || message.messageType === MessageType.FRIEND_OFFLINE) {
        this.messageService.updateFriendOnlineStatus(friend, message);
      }

      if (message.messageDeliveryStatusEnum === MessageDeliveryStatusEnum.DELIVERED || message.messageType === MessageType.UNSEEN) {

        this.messageService.updateFriendUnseenCount(friend, message);
      }

      if (message.messageType === MessageType.FRIEND_REQUEST_ACCEPTED) {

        this.addNewFriend(message.senderId);
      }

      if (message.content) {
        this.messageService.updateFriendLastMessage(friend, message);
      }

      return friend;
    });

    this.friendsListSubject.next(updatedFriendsList);
  }

  addNewFriend(senderId: string): void {
    this.friendsService.getFriendById(senderId).subscribe({
      next: (friend) => {
        const updatedFriendsList = [...this.friendsListSubject.getValue(), friend];
        this.friendsListSubject.next(updatedFriendsList);
      },
      error: (err) => console.log('Error fetching new friend:', err)
    });
  }

  updateFriend(updatedFriend: Friend): void {
    const friendsList = this.friendsListSubject.value;
    const index = friendsList.findIndex(friend => friend.connectionId === updatedFriend.connectionId);

    if (index !== -1) {
      friendsList[index] = updatedFriend;
      this.friendsListSubject.next([...friendsList]);
    }
  }
}
