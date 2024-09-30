import { Component, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Friend } from "../../models/Friend";
import { ChatMessage } from "../../models/ChatMessage";
import { WebSocketService } from "../../socket/WebSocketService";
import { AuthService } from "../../services/auth.service";
import { FriendsService } from "../../services/friends.service";
import { forkJoin } from 'rxjs';
import { tap } from 'rxjs/operators';
import { FriendsRequestService } from "../../services/friends-request.service";
import { MessageService } from '../../services/message.service';
import {MessageDeliveryStatusEnum} from "../../models/enums/MessageDeliveryStatusEnum";
import {MessageType} from "../../models/enums/MessageType";

@Component({
  selector: 'app-messenger',
  templateUrl: './messenger.component.html',
  styleUrls: ['./messenger.component.css']
})
export class MessengerComponent implements OnInit, OnChanges {
  friendsList: Friend[] = [];
  selectedFriend: Friend | null = null;
  currentUser: any = null;
  selectedTab: string = 'friends';
  requestsList: any[]  = [];

  constructor(
    private webSocketService: WebSocketService,
    private authService: AuthService,
    private friendsService: FriendsService,
    private friendsRequestService: FriendsRequestService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();

    forkJoin({
      friendsRequest: this.friendsRequestService.getReceivedRequests(),
      friends: this.friendsService.getFriends(),
      unseenMessages: this.friendsService.getUnseenMessages()
    }).subscribe({
      next: ({ friendsRequest, friends, unseenMessages }) => {
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
        this.requestsList = friendsRequest;
      },
      error: (error) => {
        console.error('Error fetching data:', error.status);
      }
    });

    this.messageService.message$.subscribe(message => {
      if (message) {
        this.handleIncomingMessage(message);
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

  handleIncomingMessage(message: ChatMessage) {
    this.friendsList = this.friendsList.map((friend) => {
      if (message.messageType === MessageType.FRIEND_ONLINE) {
        this.messageService.updateFriendOnlineStatus(friend, message);
      }

      if (message.messageDeliveryStatusEnum === MessageDeliveryStatusEnum.DELIVERED || message.messageType === MessageType.UNSEEN) {
        this.messageService.updateFriendUnseenCount(friend, message);
      }
      if (message.content) {
        this.messageService.updateFriendLastMessage(friend, message);
      }

      return friend;
    });

    this.selectedFriend = this.messageService.updateSelectedFriendOnlineStatus(this.selectedFriend, message);
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
    // Implement search logic if necessary
  }

  selectTab(tab: string) {
    this.selectedTab = tab;
  }
}
