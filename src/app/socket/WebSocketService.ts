import { Injectable } from '@angular/core';
import {Client, IMessage} from '@stomp/stompjs';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private stompClient: Client;

  constructor() {
    this.stompClient = new Client();
  }

  connect(url: string, token: string | null) {
    this.stompClient.configure({
      brokerURL: url,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => console.log('STOMP debug:', str),
      onConnect: (frame) => {
        console.log('Connected to STOMP server:', frame);
      },
      onStompError: (error) => {
        console.error('STOMP error:', error);
      },
      onWebSocketError: (error) => {
        console.error('WebSocket error:', error);
      },
      reconnectDelay: 5000,
    });

    this.stompClient.activate();
  }

  disconnect() {
    if (this.stompClient && this.stompClient.active) {
      this.stompClient.deactivate();
      console.log('Disconnected from STOMP server');
    }
  }

  publish(destination: string, body: any) {
    this.stompClient.publish({
      destination: destination,
      body: JSON.stringify(body),
    });
  };

  subscribe(topic: string, callback: (message: IMessage) => void) {
    if (this.stompClient && this.stompClient.active) {
      this.stompClient.subscribe(topic, callback);
    } else {
      console.error('STOMP client is not active. Cannot subscribe to topic:', topic);
    }
  }

}
