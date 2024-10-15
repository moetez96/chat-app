import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {ChatMessage} from "../models/ChatMessage";
import {MessageType} from "../models/enums/MessageType";
import {CurrentUser} from "../models/CurrentUser";
import {AuthService} from "../services/auth.service";
import {MessageDeliveryStatusEnum} from "../models/enums/MessageDeliveryStatusEnum";
import {ConversationService} from "../services/conversation.service";
import {Friend} from "../models/Friend";

@Injectable({
  providedIn: 'root'
})
export class ConversationHandlerService {

  private loadingSendSubject = new BehaviorSubject<boolean>(false);
  private loadingConversationSubject = new BehaviorSubject<boolean>(false);
  private chatMessageSubject = new BehaviorSubject<ChatMessage[]>([]);
  chatMessages$ = this.chatMessageSubject.asObservable();

  currentUser: CurrentUser | null = null;

  constructor(private authService: AuthService, private conversationService: ConversationService) {

  }

  setLoadingSend(state: boolean) {
    this.loadingSendSubject.next(state);
  }

  getLoadingSend(): boolean {
    return this.loadingSendSubject.getValue();
  }

  setLoadingConversation(state: boolean) {
    this.loadingConversationSubject.next(state);
  }

  getLoadingConversation() {
    return this.loadingConversationSubject.getValue();
  }

  handleIncomingMessage(message: ChatMessage, connectionId: string) {
    this.currentUser = this.authService.getCurrentUser();
    if (message.messageType === MessageType.CHAT) {
      this.addChatMessage(message, connectionId);
    } else if (message.messageType === MessageType.MESSAGE_DELIVERY_UPDATE) {
      this.updateMessageStatus(message);
    }
  }

  loadConversationMessages(convId: string, connectionId: string) {
    this.currentUser = this.authService.getCurrentUser();
    this.setLoadingConversation(true);
    this.conversationService.getConversationMessages(convId).subscribe({
      next: (response: ChatMessage[]) => {
        let chatMessages = response.filter(message =>
          (message.senderId === this.currentUser?.id && message.receiverId === connectionId) ||
          (message.senderId === connectionId && message.receiverId === this.currentUser?.id)
        );

        this.markMessagesAsSeen(chatMessages);
        this.chatMessageSubject.next(chatMessages);
        },
      error: (error) => {
        console.error('Failed to get conversation messages', error)
        this.setLoadingConversation(false);
      },
      complete: () => {
        this.setLoadingConversation(false);
      }
    });
  }

  markMessagesAsSeen(chatMessages: ChatMessage[]) {
    const unreadMessages = chatMessages.filter(msg =>
      msg.messageDeliveryStatusEnum !== MessageDeliveryStatusEnum.SEEN && msg.senderId !== this.currentUser?.id
    );

    if (unreadMessages.length > 0) {
      this.conversationService.setReadMessages(unreadMessages).subscribe({
        error: (error) => console.error('Failed to set messages as seen', error)
      });
    }
  }

  addChatMessage(message: ChatMessage, connectionId: string) {
    if ((message.senderId === this.currentUser?.id && message.receiverId === connectionId) ||
      (message.senderId === connectionId && message.receiverId === this.currentUser?.id)) {
      let chatMessages = this.chatMessageSubject.getValue();
      const newChatMessages = [...chatMessages];

      if (!newChatMessages.some(chat => chat.id === message.id)) {
        newChatMessages.push(message);
      }

      this.chatMessageSubject.next(newChatMessages);
      this.setLoadingSend(false);
    }
  }

  updateMessageStatus(message: ChatMessage) {
    if (message.messageDeliveryStatusEnum === MessageDeliveryStatusEnum.DELIVERED ||
      message.messageDeliveryStatusEnum === MessageDeliveryStatusEnum.SEEN) {

      let chatMessages = this.chatMessageSubject.getValue();

      const updatedChatMessages = chatMessages.map(chat => {
        const update = message.messageDeliveryStatusUpdates?.find(update => update.id === chat.id);
        if (update) {
          return { ...chat, messageDeliveryStatusEnum: message.messageDeliveryStatusEnum };
        }
        return chat;
      });

      this.chatMessageSubject.next(updatedChatMessages);
    }
  }

  updateSelectedFriendOnlineStatus(selectedFriend: Friend | null, message: ChatMessage): Friend | null {
    if (selectedFriend && message.userConnection?.connectionId === selectedFriend.connectionId) {
      return { ...selectedFriend, isOnline: message.messageType === MessageType.FRIEND_ONLINE };
    }
    return selectedFriend;
  }

}
