import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {forkJoin, tap} from "rxjs";
import {Friend} from "../../models/Friend";
import {WebSocketService} from "../../socket/WebSocketService";
import {AuthService} from "../../services/auth.service";
import {FriendsService} from "../../services/friends.service";
import {FriendsRequestService} from "../../services/friends-request.service";
import {MessageService} from "../../shared/message.service";
import {ChatMessage} from "../../models/ChatMessage";
import {MessageType} from "../../models/enums/MessageType";
import {MessageDeliveryStatusEnum} from "../../models/enums/MessageDeliveryStatusEnum";

@Component({
  selector: 'app-friends-list',
  templateUrl: './friends-list.component.html',
  styleUrl: './friends-list.component.css'
})
export class FriendsListComponent implements OnInit {

  @Input()
  selectedFriend: Friend | null = null;
  @Output()
  handleSelectedFriend = new EventEmitter<Friend>();

  friendsList: Friend[] = [];

  constructor(
    private webSocketService: WebSocketService,
    private authService: AuthService,
    private friendsService: FriendsService,
    private friendsRequestService: FriendsRequestService,
    private messageService: MessageService
  ) {
  }

  ngOnInit(): void {

    forkJoin({
      friends: this.friendsService.getFriends(),
      unseenMessages: this.friendsService.getUnseenMessages()
    }).subscribe({
      next: ({ friends, unseenMessages}) => {
        if (unseenMessages && unseenMessages.length > 0) {
          unseenMessages.forEach((u: any) => {
            const friend = friends.find(f => f.connectionId === u.fromUser);
            if (friend) {
              friend.unSeen = u.count;
            }
          });
        }
        this.friendsList = friends.map(friend => {
          this.loadLastMessage(friend).subscribe({
            error: (error) => console.log(error)
          });
          return friend;
        });
      },
      error: (error) => {
        console.error('Error fetching data:', error.status);
      }
    });

    this.messageService.message$.subscribe(message => {
      if (message) {

        this.handleIncomingMessage(message);

        if (message.messageType === MessageType.FRIEND_REQUEST_ACCEPTED) {
          this.fetchNewFriend(message.senderId);
        }
      }
    });
  }

  handleIncomingMessage(message: ChatMessage) {
    this.friendsList = this.friendsList.map((friend) => {
      if (message.messageType === MessageType.FRIEND_ONLINE || message.messageType === MessageType.FRIEND_OFFLINE) {
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

  fetchNewFriend(senderId: string) {
    this.friendsService.getFriendById(senderId).subscribe({
      next: ((friend) => {
        this.friendsList.push(friend);
      }),
      error: (err => console.log(err))
    });
  }

  selectConversation(selectedFriend: Friend) {
    this.selectedFriend = selectedFriend;
    this.handleSelectedFriend.emit(selectedFriend);
  }

  loadLastMessage(currentFriend: Friend) {
    return this.friendsService.getLastMessage(currentFriend.convId).pipe(
      tap((message: ChatMessage) => {
        console.log(message)
        currentFriend.lastMessage = message;
      })
    );
  }
}
