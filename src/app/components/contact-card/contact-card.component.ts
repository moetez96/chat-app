import {Component, Input, OnInit} from '@angular/core';
import {Friend} from "../../models/Friend";
import {IMessage} from "@stomp/stompjs";
import {WebSocketService} from "../../socket/WebSocketService";
import {ChatMessage} from "../../models/ChatMessage";
import {AuthService} from "../../services/auth.service";
import {MessageType} from "../../models/enums/MessageType";
import {MessageDeliveryStatusEnum} from "../../models/enums/MessageDeliveryStatusEnum";
import {CurrentUser} from "../../models/CurrentUser";

@Component({
  selector: 'app-contact-card',
  templateUrl: './contact-card.component.html',
  styleUrl: './contact-card.component.css'
})
export class ContactCardComponent implements OnInit{

  @Input()
  friend!: Friend;

  @Input()
  selectedConvId!: string | null;

  currentUser: CurrentUser | null = null;


  constructor(private authService: AuthService, private webSocketService: WebSocketService) {
  }

  ngOnInit() {

    this.currentUser = this.authService.getCurrentUser();
  }

  protected readonly MessageDeliveryStatusEnum = MessageDeliveryStatusEnum;
}
