import { Component, Input, OnChanges, OnInit, SimpleChanges, OnDestroy } from '@angular/core';
import { Friend } from "../../models/Friend";
import { IMessage } from "@stomp/stompjs";
import { ChatMessage } from "../../models/ChatMessage";
import { MessageType } from "../../models/enums/MessageType";
import { WebSocketService } from "../../socket/WebSocketService";
import { AuthService } from "../../services/auth.service";
import { FriendsService } from "../../services/friends.service";
import { forkJoin } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MessageDeliveryStatusEnum } from "../../models/enums/MessageDeliveryStatusEnum";

@Component({
  selector: 'app-messenger',
  templateUrl: './messenger.component.html',
  styleUrl: './messenger.component.css'
})
export class MessengerComponent implements OnInit, OnChanges {

  friendsList: Friend[] = [];

  selectedFriend: Friend | null = null;
  currentUser: any = null;

  constructor(
    private webSocketService: WebSocketService,
    private authService: AuthService,
    private friendsService: FriendsService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();

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
        this.friendsList = friends;

        if (this.friendsList.length > 0) {
          this.selectedFriend = this.friendsList[0];
        }

        console.log(this.friendsList);
      },
      error: (error) => {
        console.error('Error fetching data:', error.status);
      }
    });

    const token = this.authService.getToken();
    const url = 'ws://127.0.0.1:8080/ws';

    this.webSocketService.connect(url, token);

    const userId = this.authService.getCurrentUser()?.id;
    this.webSocketService.subscribe(`/topic/${userId}`, (message: IMessage) => {
      const messageBody: ChatMessage = JSON.parse(message.body);
      console.log(messageBody);
      this.friendsList = this.friendsList.map((friend) => {
        if (messageBody.userConnection && messageBody.userConnection.connectionId === friend.connectionId) {
          friend.isOnline = messageBody.messageType === MessageType.FRIEND_ONLINE;
        } else if (messageBody.senderId && messageBody.senderId === friend.connectionId) {
          if (messageBody.messageDeliveryStatusEnum === MessageDeliveryStatusEnum.DELIVERED
            || messageBody.messageType === MessageType.UNSEEN) {
            friend.unSeen++;
          }
        }

        if (messageBody.content && messageBody.senderId === friend.connectionId || messageBody.receiverId === friend.connectionId) {
          friend.lastMessage = messageBody;
        }

        return friend;
      });

      if (this.selectedFriend && messageBody.userConnection?.connectionId === this.selectedFriend.connectionId) {
        this.selectedFriend = { ...this.selectedFriend, isOnline: messageBody.messageType === MessageType.FRIEND_ONLINE };
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['friendsList'] && changes['friendsList'].currentValue.length > 0) {
      if (!this.selectedFriend) {
        this.friendsList = this.friendsList.map((friend) => {
          this.loadLastMessage(friend).subscribe({
            error: (error) => console.log(error)
          });
          return friend;
        });

        this.selectedFriend = changes['friendsList'].currentValue[0];
      }
    }
  }

  loadLastMessage(currentFriend: Friend) {
    return this.friendsService.getLastMessage(currentFriend.convId).pipe(
      tap((message: ChatMessage) => {
        console.log(message);
        currentFriend.lastMessage = message;
      })
    );
  }

  selectConversation(selectedFriend: Friend) {
    this.selectedFriend = selectedFriend;
  }

  friendSeenCounterUpdate(updatedFriend: Friend) {
    this.friendsList = this.friendsList.map(friend =>
      friend.connectionId === updatedFriend.connectionId
        ? { ...friend, unSeen: updatedFriend.unSeen, lastMessage: updatedFriend.lastMessage }
        : friend
    );
  }

  searchFriends() {

  }
}
