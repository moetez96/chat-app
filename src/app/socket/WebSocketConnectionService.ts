import { Client } from "@stomp/stompjs";
import { BehaviorSubject, Observable } from "rxjs";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root',
})
export class WebSocketConnectionService {
  private readonly stompClient: Client;
  connectionStateSubject = new BehaviorSubject<boolean>(false);

  constructor() {
    this.stompClient = new Client();
  }

  connect(url: string, token: string | null): Observable<boolean> {
    if (this.stompClient.active) {
      console.warn('WebSocket connection is already active. Skipping reconnect.');
      return this.connectionStateSubject.asObservable();
    }

    this.stompClient.configure({
      brokerURL: url,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      onConnect: (frame) => {
        console.log('Connected to STOMP server:', frame);
        this.connectionStateSubject.next(true);
      },
      onStompError: (error) => {
        console.error('STOMP error:', error);
        this.connectionStateSubject.next(false);
      },
      onWebSocketError: (error) => {
        console.error('WebSocket error:', error);
        this.connectionStateSubject.next(false);
      },
      onDisconnect: () => {
        console.log('Disconnected from STOMP server.');
        this.connectionStateSubject.next(false);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
    });

    this.stompClient.activate();
    return this.connectionStateSubject.asObservable();
  }

  disconnect() {
    if (this.stompClient?.active) {
      this.stompClient.deactivate();
      this.connectionStateSubject.next(false);
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
