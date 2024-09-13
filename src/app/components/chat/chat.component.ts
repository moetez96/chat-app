import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  AfterViewChecked,
  SimpleChanges,
  OnChanges
} from '@angular/core';
import { ChatMessage } from "../../models/ChatMessage";
import { WebSocketService } from "../../socket/WebSocketService";
import { IMessage } from "@stomp/stompjs";
import { ConversationService } from "../../services/conversation.service";
import { Subscription } from 'rxjs';
import { AuthService } from "../../services/auth.service";
import { CurrentUser } from "../../models/CurrentUser";
import { Friend } from "../../models/Friend";

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

  @ViewChild('messagesContainer') private messagesContainerRef!: ElementRef;
  @ViewChild('messagesEnd') private messagesEndRef!: ElementRef;

  constructor(private authService: AuthService, private webSocketService: WebSocketService, private conversationService: ConversationService) { }

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

  private handleSelectedFriend(friend: Friend) {
    this.currentUser = this.authService.getCurrentUser();
    this.isOnline = friend.isOnline;
    this.friendUserName = friend.connectionUsername;
    this.loadConversationMessages(friend.convId, friend.connectionId);
    this.subscribeToConversation(friend.convId, friend.connectionId);
  }

  loadConversationMessages(convId: string, connectionId: string) {
    this.conversationService.getConversationMessages(convId).subscribe({
      next: (response: ChatMessage[]) => {
        this.chatMessages = response.filter((message) => (message.senderId == this.currentUser?.id && message.receiverId == connectionId) ||
          (message.senderId == connectionId && message.receiverId == this.currentUser?.id));
        console.log('Conversation messages:', this.chatMessages);
      },
      error: (error) => {
        console.error('Failed to get conversation messages', error);
      }
    });
  }

  subscribeToConversation(convId: string, connectionId: string) {
    this.webSocketService.subscribe(`/topic/${convId}`, (message: IMessage) => {
      const messageBody: ChatMessage = JSON.parse(message.body);

      if (this.selectedFriend?.convId === convId) {
        if (((messageBody.senderId == this.currentUser?.id && messageBody.receiverId == connectionId) ||
            (messageBody.senderId == connectionId && messageBody.receiverId == this.currentUser?.id))
          && !this.chatMessages.map((chat) => chat.id).includes(messageBody.id)) {
          this.chatMessages.push(messageBody);
        }
      }
    });
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
          });
      }
      this.message = "";
    }
  }
}
