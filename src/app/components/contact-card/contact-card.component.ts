import {Component, Input, OnInit} from '@angular/core';
import {Friend} from "../../models/Friend";
import {IMessage} from "@stomp/stompjs";
import {WebSocketService} from "../../socket/WebSocketService";
import {ChatMessage} from "../../models/ChatMessage";
import {AuthService} from "../../services/auth.service";
import {MessageType} from "../../models/enums/MessageType";

@Component({
  selector: 'app-contact-card',
  templateUrl: './contact-card.component.html',
  styleUrl: './contact-card.component.css'
})
export class ContactCardComponent implements OnInit{

  @Input()
  friend!: Friend;

  constructor(private authService: AuthService, private webSocketService: WebSocketService) {
  }

  ngOnInit() {
    const userId = this.authService.getCurrentUser()?.id;
    this.webSocketService.subscribe(`/topic/${userId}`, (message: IMessage) => {
      const messageBody: ChatMessage = JSON.parse(message.body);
      console.log(messageBody);
      if(messageBody.userConnection && messageBody.userConnection.connectionId == this.friend.connectionId) {
        if (messageBody.messageType === MessageType.FRIEND_OFFLINE) {
          this.friend.isOnline = false;
        } else if (messageBody.messageType === MessageType.FRIEND_ONLINE) {
          this.friend.isOnline = true;
        }
      } else if (messageBody.senderId  && messageBody.senderId == this.friend.connectionId) {
        if (messageBody.messageType === MessageType.CHAT || messageBody.messageType === MessageType.UNSEEN) {
          this.friend.unSeen++;
        }
      }
    });
  }
}
