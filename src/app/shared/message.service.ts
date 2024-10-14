import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ChatMessage } from '../models/ChatMessage';
import { MessageType } from "../models/enums/MessageType";
import { Friend } from "../models/Friend";
import { FriendRequest } from "../models/FriendRequest";
import { SimpleNotif } from "../models/SimpleNotif";

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private messageSubject = new BehaviorSubject<ChatMessage | null>(null);
  public message$ = this.messageSubject.asObservable();

  setMessage(message: ChatMessage) {
    this.messageSubject.next(message);
  }

  clearMessage() {
    this.messageSubject.next(null);
  }

}
