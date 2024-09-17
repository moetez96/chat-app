import {
  AfterViewChecked,
  Component,
  ElementRef, EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit, Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {ChatMessage} from "../../models/ChatMessage";
import {WebSocketService} from "../../socket/WebSocketService";
import {IMessage} from "@stomp/stompjs";
import {ConversationService} from "../../services/conversation.service";
import {AuthService} from "../../services/auth.service";
import {CurrentUser} from "../../models/CurrentUser";
import {Friend} from "../../models/Friend";
import {MessageDeliveryStatusEnum} from "../../models/enums/MessageDeliveryStatusEnum";
import {MessageType} from "../../models/enums/MessageType";
import {DateUtils} from "../../utils/DateUtils";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked, OnChanges {

  @Input()
  selectedFriend: Friend | null = null;

  chatMessages: ChatMessage[] = [];
  currentUser: CurrentUser | null = null;
  message: string = "";
  isOnline: boolean = false;
  friendUserName: string | null = null;

  @Output() friendChanged = new EventEmitter<Friend>();


  @ViewChild('messagesContainer') private messagesContainerRef!: ElementRef;
  @ViewChild('messagesEnd') private messagesEndRef!: ElementRef;

  constructor(private authService: AuthService, private webSocketService: WebSocketService,
              private conversationService: ConversationService) { }

  ngOnInit() {
    if (this.selectedFriend) {
      this.handleSelectedFriend(this.selectedFriend);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedFriend']) {
      const previousFriend = changes['selectedFriend'].previousValue;
      if (previousFriend) {
        this.webSocketService.unsubscribe(`/topic/${previousFriend.convId}`);
      }

      const newFriend = changes['selectedFriend'].currentValue;
      if (newFriend) {
        this.handleSelectedFriend(newFriend);
      }
    }
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  ngOnDestroy() {
    if (this.selectedFriend) {
      this.webSocketService.unsubscribe(`/topic/${this.selectedFriend.convId}`);
    }
  }

  private async handleSelectedFriend(friend: Friend) {
    this.currentUser = this.authService.getCurrentUser();
    this.isOnline = friend.isOnline;
    this.friendUserName = friend.connectionUsername;

    try {
      await this.loadConversationMessages(friend.convId, friend.connectionId);
      await this.subscribeToConversation(friend.convId, friend.connectionId);
    } catch (error) {
      console.error('Error handling selected friend:', error);
    }
  }

  loadConversationMessages(convId: string, connectionId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.conversationService.getConversationMessages(convId).subscribe({
        next: (response: ChatMessage[]) => {
          console.log('Conversation response:', response);
          this.chatMessages = response.filter((message) =>
            (message.senderId == this.currentUser?.id && message.receiverId == connectionId) ||
            (message.senderId == connectionId && message.receiverId == this.currentUser?.id)
          );
          this.seeMessages(this.chatMessages);
          console.log('Conversation messages:', this.chatMessages);
          resolve();
        },
        error: (error) => {
          console.error('Failed to get conversation messages', error);
          reject(error);
        }
      });
    });
  }

  seeMessages(chatMessages: ChatMessage[]) {
    this.conversationService.setReadMessages(
      chatMessages.filter((msg) => msg.messageDeliveryStatusEnum !== MessageDeliveryStatusEnum.SEEN && msg.senderId !== this.currentUser?.id))
      .subscribe({
        next: (response: ChatMessage[]) => {
          console.log(response)
        },
        error: (error) => {
          console.error('Failed to get set messages to seen', error);
        }
      });
  }

  subscribeToConversation(convId: string, connectionId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.webSocketService.subscribe(`/topic/${convId}`, (message: IMessage) => {
          const messageBody: ChatMessage = JSON.parse(message.body);

          if (this.selectedFriend?.convId === convId) {
            if (((messageBody.senderId == this.currentUser?.id && messageBody.receiverId == connectionId) ||
                (messageBody.senderId == connectionId && messageBody.receiverId == this.currentUser?.id))
              && !this.chatMessages.map((chat) => chat.id).includes(messageBody.id)) {
              this.chatMessages.push(messageBody);
            } else if (messageBody.messageType === MessageType.MESSAGE_DELIVERY_UPDATE &&
              messageBody.messageDeliveryStatusEnum === MessageDeliveryStatusEnum.SEEN) {
              if (this.selectedFriend) {
                this.loadConversationMessages(this.selectedFriend.convId, this.selectedFriend.connectionId)
                  .then(() => {
                    if (this.chatMessages.length > 0) {
                      const lastMessage = this.chatMessages[this.chatMessages.length - 1];
                      console.log(lastMessage);
                      this.resetFriendViewCounter(this.selectedFriend, lastMessage);
                    }
                  })
                  .catch(error => console.error('Failed to load conversation messages during subscription', error));
              }
            }
          }

          resolve();
        });
      } catch (error) {
        console.error('Failed to subscribe to conversation', error);
        reject(error);
      }
    });
  }

  resetFriendViewCounter(friend: Friend | null, lastMessage: ChatMessage | undefined) {
    if (friend) {
      friend.unSeen = 0;
      if (lastMessage) {
        friend.lastMessage = lastMessage;
      }
      this.friendChanged.emit(friend);
    }
  }

  private scrollToBottom(): void {
    const messagesWrapper = this.messagesContainerRef.nativeElement;
    const messagesEnd = this.messagesEndRef.nativeElement;
    messagesWrapper.scrollTop = messagesEnd.offsetTop;
  }

  sendMessage() {
    if (this.message !== "") {
      const selectedFriend = this.selectedFriend;
      if (selectedFriend?.convId) {
        this.webSocketService.publish(`/app/chat/sendMessage/${selectedFriend.convId}`,
          {
            messageType: "CHAT",
            content: this.message,
            receiverId: selectedFriend.connectionId,
            receiverUsername: selectedFriend.connectionUsername,
            time: Date.now()
          });
      }
      this.message = "";
    }
  }

  protected readonly MessageDeliveryStatusEnum = MessageDeliveryStatusEnum;
  protected readonly MessageType = MessageType;
  protected readonly DateUtils = DateUtils;
}
