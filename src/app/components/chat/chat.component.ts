import {
  AfterViewChecked,
  Component,
  ElementRef,
  Input, OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { ChatMessage } from "../../models/ChatMessage";
import { WebSocketService } from "../../socket/WebSocketService";
import { ConversationService } from "../../services/conversation.service";
import { AuthService } from "../../services/auth.service";
import { CurrentUser } from "../../models/CurrentUser";
import { Friend } from "../../models/Friend";
import { MessageDeliveryStatusEnum } from "../../models/enums/MessageDeliveryStatusEnum";
import { MessageType } from "../../models/enums/MessageType";
import { PollingService } from "../../shared/polling.service";
import {DateUtils} from "../../utils/DateUtils";
import {ConversationHandlerService} from "../../shared/conversation-handler.service";
import {MessageService} from "../../shared/message.service";
import {FriendsService} from "../../services/friends.service";
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnChanges, OnDestroy, AfterViewChecked {

  selectedFriend: Friend | null = null;

  @Input() selectedId!: string | null;

  @ViewChild('messagesContainer') private messagesContainerRef!: ElementRef;
  @ViewChild('messagesEnd') private messagesEndRef!: ElementRef;

  chatMessages: ChatMessage[] = [];
  currentUser: CurrentUser | null = null;
  message: string = "";

  private subscription: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private webSocketService: WebSocketService,
    private pollingService: PollingService,
    private conversationService: ConversationService,
    private conversationHandlerService: ConversationHandlerService,
    private messageService: MessageService,
    private friendsService: FriendsService,
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes["selectedId"]) {
      this.selectedId = changes["selectedId"].currentValue;

      if (this.selectedId) {
        this.subscription.add(
          this.friendsService.getFriendById(this.selectedId).subscribe({
            next: (friend) => {
              this.selectedFriend = friend;
              this.handleSelectedFriend(this.selectedFriend);
            },
            error: (error) => {
              console.log(error);
            }
          })
        );
      }
    }
  }

  subscribeToMessages(connectionId: string): void {
    this.subscription.add(
      this.messageService.message$.subscribe(message => {
        if (message) {
          this.conversationHandlerService.handleIncomingMessage(message, connectionId);
          this.selectedFriend = this.conversationHandlerService.updateSelectedFriendOnlineStatus(this.selectedFriend, message);
        }
      })
    );

    this.subscription.add(
      this.conversationHandlerService.chatMessages$.subscribe(messages => {
        this.chatMessages = [...messages];
      })
    );
  }

  handleSelectedFriend(friend: Friend) {
    if (!friend) {
      return;
    }

    this.conversationHandlerService.loadConversationMessages(friend.convId, friend.connectionId);
    this.subscribeToConversation(friend.convId);
    this.subscribeToMessages(friend.connectionId);
  }

  subscribeToConversation(convId: string) {
    this.webSocketService.subscribeToConversation(convId);
  }

  sendMessage() {
    if (this.message && this.selectedFriend?.convId) {
      this.conversationHandlerService.setLoadingSend(true);

      this.webSocketService.publish(this.selectedFriend.convId, {
        messageType: MessageType.CHAT,
        content: this.message,
        receiverId: this.selectedFriend.connectionId,
        receiverUsername: this.selectedFriend.connectionUsername,
        time: Date.now()
      });

      this.message = "";
    }
  }

  scrollToBottom() {
    if (this.messagesContainerRef && this.messagesEndRef) {
      const messagesWrapper = this.messagesContainerRef.nativeElement;
      const messagesEnd = this.messagesEndRef.nativeElement;
      messagesWrapper.scrollTop = messagesEnd.offsetTop;
    }
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  get getLoadingSend(): boolean {
    return this.conversationHandlerService.getLoadingSend();
  }

  get getLoadingConversation(): boolean {
    return this.conversationHandlerService.getLoadingConversation();
  }

  get isServerReady(): boolean {
    return this.pollingService.isServerReady();
  }

  ngOnDestroy() {
    this.webSocketService.unsubscribeFromConversation();
    this.subscription.unsubscribe();
  }

  protected readonly DateUtils = DateUtils;
  protected readonly MessageDeliveryStatusEnum = MessageDeliveryStatusEnum;
  protected readonly MessageType = MessageType;
}
