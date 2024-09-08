import {Component, Input, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewChecked} from '@angular/core';
import { ChatMessage } from "../../models/ChatMessage";
import { WebSocketService } from "../../socket/WebSocketService";
import { IMessage } from "@stomp/stompjs";
import { ConversationService } from "../../services/conversation.service";
import { BehaviorSubject } from 'rxjs';
import {AuthService} from "../../services/auth.service";
import {CurrentUser} from "../../models/CurrentUser";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {

  @Input()
  set selectedConvId(value: string | null) {
    this.selectedConvIdSubject.next(value);
  }

  private selectedConvIdSubject = new BehaviorSubject<string | null>(null);

  chatMessages: ChatMessage[] = [];
  currentUser: CurrentUser | null = null;

  @ViewChild('messagesContainer') private messagesContainerRef!: ElementRef;
  @ViewChild('messagesEnd') private messagesEndRef!: ElementRef;
  constructor(private authService: AuthService, private webSocketService: WebSocketService, private conversationService: ConversationService) { }

  ngOnInit() {
    this.selectedConvIdSubject.subscribe(convId => {
      if (convId) {
        this.currentUser = this.authService.getCurrentUser();
        this.loadConversationMessages(convId);
        this.subscribeToTopic(convId);
      }
    });
  }

  private loadConversationMessages(convId: string) {
    this.conversationService.getConversationMessages(convId).subscribe({
      next: (response: ChatMessage[]) => {
        this.chatMessages = response;
        console.log('Conversation messages:', this.chatMessages);
      },
      error: (error) => {
        console.error('Failed to get conversation messages', error);
      }
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  subscribeToTopic(convId: string) {
    this.webSocketService.subscribe(`/topic/${convId}`, (message: IMessage) => {
      const messageBody: ChatMessage = JSON.parse(message.body);
      console.log("Received message:", messageBody);
    });
  }

  private scrollToBottom(): void {
    const messagesWrapper = this.messagesContainerRef.nativeElement;
    const messagesEnd = this.messagesEndRef.nativeElement;
    messagesWrapper.scrollTop = messagesEnd.offsetTop;
  }

  ngOnDestroy() {

  }
}
