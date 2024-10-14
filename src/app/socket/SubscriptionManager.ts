import { StompSubscription, IMessage } from "@stomp/stompjs";
import { Injectable } from "@angular/core";
import {WebSocketConnectionService} from "./WebSocketConnectionService";
import {AuthService} from "../services/auth.service";
import {ChatMessage} from "../models/ChatMessage";
import {MessageService} from "../shared/message.service";

@Injectable({
  providedIn: 'root',
})
export class SubscriptionManager {
  private subscriptions: Map<string, StompSubscription> = new Map();
  private currentConversationId: string | null = null;

  constructor(private connectionService: WebSocketConnectionService,
              private authService: AuthService,
              private messageService: MessageService) {
  }

  subscribeToUser() {
    const userId = this.authService.getCurrentUser()?.id;

    if (userId) {
      const topic = `/topic/${userId}`;
      this.subscribe(topic, (message: IMessage) => {
        const messageBody: ChatMessage = JSON.parse(message.body);
        this.messageService.setMessage(messageBody);
      }, "user");
    }
  }

  subscribeToConversation(conversationId: string) {

    if (this.subscriptions.has("conversation")) {
      this.unsubscribe("conversation");
    }

    this.currentConversationId = conversationId;
    const topic = `/topic/${conversationId}`;
    this.subscribe(topic, (message: IMessage) => {
      const messageBody: ChatMessage = JSON.parse(message.body);
      this.messageService.setMessage(messageBody);
    }, "conversation");
  }

  private subscribe(topic: string, callback: (message: IMessage) => void, subscriptionKey: string, retryCount: number = 0) {
    const maxRetries = 10;

    if (this.subscriptions.has(subscriptionKey)) {
      console.warn(`Already subscribed to '${subscriptionKey}'`);
      return;
    }

    const stompClient = this.connectionService.getClient();

    if (stompClient.connected) {

      const subscription = stompClient.subscribe(topic, callback);
      this.subscriptions.set(subscriptionKey, subscription);
      console.log(`Subscribed to '${subscriptionKey}' on topic: ${topic}`);

    } else {

      if (retryCount < maxRetries) {
        console.warn(`STOMP client not connected. Retrying subscription '${subscriptionKey}' (Attempt ${retryCount + 1}/${maxRetries})`);

        setTimeout(() => {
          this.subscribe(topic, callback, subscriptionKey, retryCount + 1);
        }, 5000);
      } else {
        console.error(`Failed to subscribe to '${subscriptionKey}' after ${maxRetries} attempts. Please check the connection.`);
      }
    }
  }


  unsubscribe(subscriptionKey: string) {
    const subscription = this.subscriptions.get(subscriptionKey);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(subscriptionKey);
      this.currentConversationId = null;
      console.log(`Unsubscribed from '${subscriptionKey}'`);
    }
  }

  subscribeToAll() {
    this.subscriptions.clear();
    this.subscribeToUser();

    if (this.currentConversationId) {
      this.subscribeToConversation(this.currentConversationId);
    }
  }

  unsubscribeAll() {
    this.subscriptions.forEach((subscription, key) => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();
    this.currentConversationId = null;
  }

}
