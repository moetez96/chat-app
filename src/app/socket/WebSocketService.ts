import { Injectable } from "@angular/core";
import {WebSocketConnectionService} from "./WebSocketConnectionService";
import {SubscriptionManager} from "./SubscriptionManager";
import {environment} from "../../environments/environment";
import {ChatMessage} from "../models/ChatMessage";
import {AuthService} from "../services/auth.service";
import {MessageService} from "../shared/message.service";
import {IMessage} from "@stomp/stompjs";

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  constructor(
    private connectionService: WebSocketConnectionService,
    private subscriptionManager: SubscriptionManager,
    private authService: AuthService,
    private messageService: MessageService
  ) {}

  connect(url: string, token: string | null) {
    this.connectionService.connect(url, token).subscribe((connected) => {
      if (connected) {
        this.subscriptionManager.resubscribeToAll();
      }
    });
  }

  disconnect() {
    this.connectionService.disconnect();
    this.subscriptionManager.unsubscribeAll();
  }

  subscribeToUser(callback: (message: any) => void) {
    this.subscriptionManager.subscribeToUser(callback);
  }

  subscribeToConversation(conversationId: string, callback: (message: any) => void) {
    this.subscriptionManager.subscribeToConversation(conversationId, callback);
  }

  unsubscribeFromConversation() {
    this.subscriptionManager.unsubscribe("conversation");
  }

  publish(destination: string, message: any) {
    this.connectionService.publish(destination, message);
  }

  subscribeToWebSocket() {
    const token = this.authService.getToken();
    const url = environment.wsUrl;

    this.connect(url, token);
    this.subscribeToUser((message: IMessage) => {
      const messageBody: ChatMessage = JSON.parse(message.body);
      this.messageService.setMessage(messageBody);
    });
  }
}
