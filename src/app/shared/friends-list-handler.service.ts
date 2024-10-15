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
    switch (message.messageType) {
      case MessageType.FRIEND_ONLINE:
      case MessageType.FRIEND_OFFLINE:
        this.updateFriendOnlineStatus(message);
        break;

      case MessageType.UNSEEN:
        this.updateFriendUnseenCount(message);
        break;

      case MessageType.MESSAGE_DELIVERY_UPDATE:
        this.updateMessageStatus(message);
        break;
    }

    if (message.messageDeliveryStatusEnum === MessageDeliveryStatusEnum.DELIVERED) {
      this.updateFriendUnseenCount(message);
    }

    if (message.content) {
      this.updateFriendLastMessage(message);
    }
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

  updateFriendOnlineStatus(message: ChatMessage) {

    let friendsList = this.friendsListSubject.getValue();
    let updatedFriend = friendsList.find((friend) => message.userConnection && message.userConnection.connectionId === friend.connectionId);
    if (updatedFriend) {
      updatedFriend.isOnline = message.messageType === MessageType.FRIEND_ONLINE;
    }

    this.friendsListSubject.next(this.removeDuplicates([...friendsList]));
  }

  updateFriendUnseenCount(message: ChatMessage) {

    let friendsList = this.friendsListSubject.getValue();
    let updatedFriend = friendsList.find((friend) => message.senderId && message.senderId === friend.connectionId);
    if (updatedFriend) {
      updatedFriend.unSeen++;
    }

    this.friendsListSubject.next(this.removeDuplicates([...friendsList]));
  }

  updateFriendLastMessage(message: ChatMessage) {

    let friendsList = this.friendsListSubject.getValue();
    let updatedFriend = friendsList.find((friend) => message.content && (message.senderId === friend.connectionId || message.receiverId === friend.connectionId));
    if (updatedFriend) {
      updatedFriend.lastMessage = message;
    }

    this.friendsListSubject.next(this.removeDuplicates([...friendsList]));
  }

  private removeDuplicates(friends: Friend[]): Friend[] {
    return friends.filter((friend, index, self) =>
      index === self.findIndex(f => f.connectionId === friend.connectionId)
    );
  }

  private updateMessageStatus(message: ChatMessage) {
    if (
      message.messageDeliveryStatusEnum === MessageDeliveryStatusEnum.DELIVERED ||
      message.messageDeliveryStatusEnum === MessageDeliveryStatusEnum.SEEN
    ) {
      const messageDeliveryStatusUpdates = message.messageDeliveryStatusUpdates;

      let lastMessage;

      if (messageDeliveryStatusUpdates.length === 0) {
        return;
      }

      lastMessage = messageDeliveryStatusUpdates[messageDeliveryStatusUpdates.length - 1];

      if (!lastMessage) {
        return;
      }

      let friendsList = this.friendsListSubject.getValue();
      const foundFriend = friendsList.find(friend => friend?.lastMessage?.id === lastMessage?.id);
      console.log(foundFriend);
      if (foundFriend) {
        foundFriend.lastMessage.messageDeliveryStatusEnum = message.messageDeliveryStatusEnum;
        console.log(foundFriend);
        console.log(friendsList);
        this.friendsListSubject.next([...friendsList]);
      }
    }
  }

}
