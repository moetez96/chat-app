import { Injectable } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private readonly stompClient: Client;
  private connectionStateSubject = new BehaviorSubject<boolean>(false);
  private subscriptions: Map<string, StompSubscription> = new Map();

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
     // debug: (str) => console.log('STOMP debug:', str),
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
      reconnectDelay: 1000,
      heartbeatIncoming: 5000,
      heartbeatOutgoing: 5000,
    });

    this.stompClient.activate();
    return this.connectionStateSubject.asObservable();
  }


  disconnect() {
    if (this.stompClient && this.stompClient.active) {
      this.stompClient.deactivate();
      console.log('Disconnected from STOMP server');
      this.connectionStateSubject.next(false);
      this.unsubscribeAll();
    }
  }

  publish(destination: string, body: any) {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.publish({
        destination: destination,
        body: JSON.stringify(body),
      });
    } else {
      console.error('STOMP client is not connected. Cannot publish message to:', destination);
    }
  }

  subscribe(topic: string, callback: (message: IMessage) => void) {
    console.log(this.subscriptions);

    if (this.subscriptions.has(topic)) {
      console.warn(`Subscription to topic '${topic}' already exists. Skipping re-subscription.`);
      return;
    }

    this.connectionStateSubject.subscribe((isConnected) => {
      if (isConnected && this.stompClient && this.stompClient.connected) {
        const subscription = this.stompClient.subscribe(topic, callback);
        this.subscriptions.set(topic, subscription);
        console.log(`Successfully subscribed to topic: ${topic}`);
      } else {
        console.error(`STOMP client is not active. Cannot subscribe to topic: ${topic}`);
        setTimeout(() => {
          this.subscribe(topic, callback);
        }, 1000);
      }
    });
  }


  unsubscribe(topic: string) {
    const subscription = this.subscriptions.get(topic);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(topic);
      console.log('Unsubscribed from topic:', topic);
    } else {
      console.warn('No active subscription for topic:', topic);
    }
  }

  unsubscribeAll() {
    this.subscriptions.forEach((subscription, topic) => {
      subscription.unsubscribe();
      console.log('Unsubscribed from topic:', topic);
    });
    this.subscriptions.clear();
  }
}
