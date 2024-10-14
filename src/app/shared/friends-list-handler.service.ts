import {Injectable} from '@angular/core';
import {BehaviorSubject, forkJoin, Observable, tap} from 'rxjs';
import {Friend} from '../models/Friend';
import {FriendsService} from '../services/friends.service';
import {ChatMessage} from '../models/ChatMessage';
import {MessageType} from '../models/enums/MessageType';
import {MessageDeliveryStatusEnum} from '../models/enums/MessageDeliveryStatusEnum';
import {MessageService} from './message.service';
import {ToastrService} from "ngx-toastr";

@Injectable({
  providedIn: 'root'
})
export class FriendsListHandlerService {

  private friendsListSubject = new BehaviorSubject<Friend[]>([]);

  friendsList$ = this.friendsListSubject.asObservable();

  constructor(
    private friendsService: FriendsService,
    private messageService: MessageService,
    private toastr: ToastrService
  ) {}

  loadFriendsAndUnseenMessages(): Promise<void> {
    return new Promise((resolve, reject) => {
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

          const uniqueFriends = this.removeDuplicates(friends);
          const lastMessagesObservables = uniqueFriends.map(friend => this.loadLastMessage(friend));

          forkJoin(lastMessagesObservables).subscribe({
            next: () => {
              this.friendsListSubject.next(uniqueFriends);
              resolve();
            },
            error: (error) => {
              console.log(error);
              reject(error);
            }
          });
        },
        error: (error) => {
          this.toastr.error('Error fetching friends', 'Server error');
          console.error('Error fetching friends:', error);
          reject(error);
        }
      });
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
        this.updateFriendOnlineStatus(friend, message);
      }

      if (message.messageDeliveryStatusEnum === MessageDeliveryStatusEnum.DELIVERED || message.messageType === MessageType.UNSEEN) {
        this.updateFriendUnseenCount(friend, message);
      }

      if (message.messageType === MessageType.FRIEND_REQUEST_ACCEPTED) {
        this.toastr.info(message.senderUsername + ' accepted your friend request', 'Accepted friend request');
        this.addNewFriend(message.senderId);
      }

      if (message.content) {
        this.updateFriendLastMessage(friend, message);
      }

      return friend;
    });

    this.friendsListSubject.next(this.removeDuplicates(updatedFriendsList));
  }

  sortFriends(friends: Friend[]): Friend[] {
    return friends.sort((a, b) => {
      const timeA = a.lastMessage?.time ? new Date(a.lastMessage.time).getTime() : null;
      const timeB = b.lastMessage?.time ? new Date(b.lastMessage.time).getTime() : null;

      if (timeA && timeB) {
        return timeB - timeA;
      }
      if (timeA) {
        return -1;
      }
      if (timeB) {
        return 1;
      }

      return a.connectionUsername.localeCompare(b.connectionUsername);
    });
  }

  addNewFriend(senderId: string): void {
    this.friendsService.getFriendById(senderId).subscribe({
      next: (friend) => {
        const currentList = this.friendsListSubject.getValue();
        const updatedFriendsList = [...currentList, friend];
        this.friendsListSubject.next(this.removeDuplicates(updatedFriendsList));
      },
      error: (err) => console.log('Error fetching new friend:', err)
    });
  }

  updateFriendOnlineStatus(friend: Friend, message: ChatMessage) {
    if (message.userConnection && message.userConnection.connectionId === friend.connectionId) {

      friend.isOnline = message.messageType === MessageType.FRIEND_ONLINE;
    }
  }

  updateFriendUnseenCount(friend: Friend, message: ChatMessage) {
    if (message.senderId && message.senderId === friend.connectionId) {
      friend.unSeen++;
    }
  }

  updateFriendLastMessage(friend: Friend, message: ChatMessage) {
    if (message.content && (message.senderId === friend.connectionId || message.receiverId === friend.connectionId)) {
      friend.lastMessage = message;
    }
  }

  private removeDuplicates(friends: Friend[]): Friend[] {
    return friends.filter((friend, index, self) =>
      index === self.findIndex(f => f.connectionId === friend.connectionId)
    );
  }
}
