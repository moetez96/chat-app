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

  loadingConversation: boolean = false;
  loadingSend: boolean = false;

  private conversationSubscription!: Subscription;
  private messageSubscription!: Subscription

  private subscriptions: Subscription = new Subscription();

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

    this.subscriptions.add(
      this.conversationHandlerService.loadingSend$.subscribe((isLoading: boolean) => {
        this.loadingSend = isLoading;
      })
    );

    this.subscriptions.add(
      this.conversationHandlerService.loadingConversation$.subscribe((isLoading: boolean) => {
        this.loadingConversation= isLoading;
      })
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes["selectedId"]) {
      this.message = "";
      this.selectedId = changes["selectedId"].currentValue;

      if (this.conversationSubscription) {
        this.conversationSubscription.unsubscribe();
      }

      if (this.messageSubscription) {
        this.messageSubscription.unsubscribe();
      }

      if (this.selectedId) {
        this.friendsService.getFriendById(this.selectedId).subscribe({
          next: (friend) => {
            this.selectedFriend = friend;
            this.handleSelectedFriend(this.selectedFriend);
          },
          error: (error) => {
            console.log(error);
          }
        });
      }
    }
  }

  subscribeToMessages(connectionId: string): void {
    this.messageSubscription = this.messageService.message$.subscribe(message => {
      if (message) {
        this.conversationHandlerService.handleIncomingMessage(message, connectionId);
        this.selectedFriend = this.conversationHandlerService.updateSelectedFriendOnlineStatus(this.selectedFriend, message);
      }
    });

    this.conversationSubscription = this.conversationHandlerService.chatMessages$.subscribe(messages => {
        this.chatMessages = [...messages];
        this.message = "";
    });
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
    if (this.message && this.selectedFriend?.convId && !this.loadingSend) {
      this.conversationHandlerService.setLoadingSend(true);

      this.webSocketService.publish(this.selectedFriend.convId, {
        messageType: MessageType.CHAT,
        content: this.message,
        receiverId: this.selectedFriend.connectionId,
        receiverUsername: this.selectedFriend.connectionUsername,
        time: Date.now()
      });
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

  get isServerReady(): boolean {
    return this.pollingService.isServerReady();
  }

  ngOnDestroy() {

    if (this.conversationSubscription) {
      this.conversationSubscription.unsubscribe();
    }
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }

    this.subscriptions.unsubscribe();
    this.webSocketService.unsubscribeFromConversation();
  }

  protected readonly DateUtils = DateUtils;
  protected readonly MessageDeliveryStatusEnum = MessageDeliveryStatusEnum;
  protected readonly MessageType = MessageType;
}
