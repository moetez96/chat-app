  import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
  import {Friend} from "../../models/Friend";
  import {IMessage} from "@stomp/stompjs";
  import {ChatMessage} from "../../models/ChatMessage";
  import {MessageType} from "../../models/enums/MessageType";
  import {WebSocketService} from "../../socket/WebSocketService";
  import {AuthService} from "../../services/auth.service";

  @Component({
    selector: 'app-messenger',
    templateUrl: './messenger.component.html',
    styleUrl: './messenger.component.css'
  })
  export class MessengerComponent implements OnInit, OnChanges{

    @Input()
    friendsList: Friend[] = [];

    selectedFriend: Friend | null = null;

    constructor(private webSocketService: WebSocketService, private authService: AuthService) {
    }

    ngOnInit() {
      if (this.friendsList.length > 0) {
        this.selectedFriend = this.friendsList[0];
      } else {
        console.log("Friends List is empty");
      }

      const userId = this.authService.getCurrentUser()?.id;
      this.webSocketService.subscribe(`/topic/${userId}`, (message: IMessage) => {
        const messageBody: ChatMessage = JSON.parse(message.body);
          this.friendsList = this.friendsList.map((friend) => {
          if(messageBody.userConnection && messageBody.userConnection.connectionId == friend.connectionId) {
            if (messageBody.messageType === MessageType.FRIEND_OFFLINE) {
              friend.isOnline = false;
            } else if (messageBody.messageType === MessageType.FRIEND_ONLINE) {
              friend.isOnline = true;
            }
          } else if (messageBody.senderId  && messageBody.senderId == friend.connectionId) {
            if (messageBody.messageType === MessageType.CHAT || messageBody.messageType === MessageType.UNSEEN) {
              friend.unSeen++;
            }
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
          this.selectedFriend = changes['friendsList'].currentValue[0];
          console.log('selectedConvId updated:', this.selectedFriend);
        }
      }
    }

    selectConversation(selectedFriend: Friend) {
      this.selectedFriend = selectedFriend;
    }
  }
