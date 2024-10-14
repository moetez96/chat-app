import { Client } from "@stomp/stompjs";
import { Injectable } from "@angular/core";
import {PollingService} from "../shared/polling.service";

@Injectable({
  providedIn: 'root',
})
export class WebSocketConnectionService {
  private readonly stompClient: Client;

  constructor(private pollingService: PollingService) {
    this.stompClient = new Client();
  }

  connect(url: string, token: string | null) {
    if (this.stompClient.active) {
      console.warn('WebSocket connection is already active. Skipping reconnect.');
    }

    this.stompClient.configure({
      brokerURL: url,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      onConnect: (frame) => {
        console.log('Connected to STOMP server:', frame);
      },
      onStompError: (error) => {
        console.error('STOMP error:', error);
        this.pollingService.setServerState(false);
      },
      onWebSocketError: (error) => {
        console.error('WebSocket error:', error);
        this.pollingService.setServerState(false);
      },
      onDisconnect: () => {
        console.log('Disconnected from STOMP server.');
        this.pollingService.setServerState(false);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
    });

    this.stompClient.activate();
  }

  disconnect() {
    if (this.stompClient?.active) {
      this.stompClient.deactivate();
      this.pollingService.setServerState(false);
      console.log('Disconnected from WebSocket');
    }
  }

  publish(destination: string, body: any) {
    if (this.stompClient?.connected) {
      this.stompClient.publish({
        destination: destination,
        body: JSON.stringify(body),
      });
    } else {
      console.error('STOMP client is not connected. Cannot publish message to:', destination);
    }
  }

  getClient() {
    return this.stompClient;
  }
}
