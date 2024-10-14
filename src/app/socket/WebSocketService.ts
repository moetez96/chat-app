import { Injectable } from "@angular/core";
import {WebSocketConnectionService} from "./WebSocketConnectionService";
import {SubscriptionManager} from "./SubscriptionManager";
import {environment} from "../../environments/environment";
import {AuthService} from "../services/auth.service";

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {

  constructor(
    private connectionService: WebSocketConnectionService,
    private subscriptionManager: SubscriptionManager,
    private authService: AuthService
  ) {}

  connect(url: string, token: string | null) {
    this.connectionService.connect(url, token);
  }

  disconnect() {
    this.connectionService.disconnect();
    this.subscriptionManager.unsubscribeAll();
  }

  subscribeToConversation(conversationId: string) {
    this.subscriptionManager.subscribeToConversation(conversationId);
  }

  unsubscribeFromConversation() {
    this.subscriptionManager.unsubscribe("conversation");
  }

  publish(destination: string, message: any) {
    this.connectionService.publish(`/app/chat/sendMessage/${destination}`, message);
  }

  subscribeToWebSocket() {
    const token = this.authService.getToken();
    const url = environment.wsUrl;

    this.connect(url, token);
    this.subscriptionManager.subscribeToAll();
  }

}
