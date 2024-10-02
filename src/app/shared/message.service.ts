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

  private unseenMessagesSubject = new BehaviorSubject<SimpleNotif[]>([]);
  private unseenRequestsSubject = new BehaviorSubject<SimpleNotif[]>([]);

  public unseenMessages$ = this.unseenMessagesSubject.asObservable();
  public unseenRequests$ = this.unseenRequestsSubject.asObservable();

  setMessage(message: ChatMessage) {
    this.messageSubject.next(message);
  }

  clearMessage() {
    this.messageSubject.next(null);
  }

  updateFriendOnlineStatus(friend: Friend, message: ChatMessage) {
    if (message.userConnection && message.userConnection.connectionId === friend.connectionId) {
      friend.isOnline = message.messageType === MessageType.FRIEND_ONLINE;
    }
  }

  updateFriendUnseenCount(friend: Friend, message: ChatMessage) {
    if (message.senderId && message.senderId === friend.connectionId) {
      friend.unSeen++;
    }
  }

  updateFriendLastMessage(friend: Friend, message: ChatMessage) {
    if (message.content && (message.senderId === friend.connectionId || message.receiverId === friend.connectionId)) {
      friend.lastMessage = message;
    }
  }

  updateSelectedFriendOnlineStatus(selectedFriend: Friend | null, message: ChatMessage): Friend | null {
    if (selectedFriend && message.userConnection?.connectionId === selectedFriend.connectionId) {
      return { ...selectedFriend, isOnline: message.messageType === MessageType.FRIEND_ONLINE };
    }
    return selectedFriend;
  }

  addFriendRequest(receivedRequests: FriendRequest[], message: any): FriendRequest[] {
    const friendRequest: FriendRequest = {
      id: 0,
      sender: {
        connectionId: message.senderId,
        connectionUsername: message.senderUsername,
        convId: '',
        unSeen: '0'
      },
      receiver: {
        connectionId: message.receiverId,
        connectionUsername: message.receiverUsername,
        convId: '',
        unSeen: '0'
      },
      createdDate: new Date(),
      deliveryStatus: ''
    };
    return [...receivedRequests, friendRequest];
  }

  removeAcceptedFriend(contactsList: Friend[], message: any): Friend[] {
    return contactsList.filter((friend) => friend.connectionId !== message.senderId);
  }

  removeDeclinedFriendRequest(sentRequests: FriendRequest[], message: any): FriendRequest[] {
    return sentRequests.filter((req) => req.receiver.connectionId !== message.senderId);
  }

  removeCanceledFriendRequest(receivedRequests: FriendRequest[], message: any): FriendRequest[] {
    return receivedRequests.filter((req) => req.sender.connectionId !== message.senderId);
  }

  addUnseenMessage(message: SimpleNotif): void {
    const unseenMessages = this.unseenMessagesSubject.getValue();
    const isDuplicate = unseenMessages.some(
      (msg) => msg.senderId === message.senderId && msg.receiverId === message.receiverId
    );
    if (!isDuplicate) {
      this.unseenMessagesSubject.next([...unseenMessages, message]);
    }
  }

  setUnseenMessage(messages: SimpleNotif[]): void {
    this.unseenMessagesSubject.next(messages);
  }

  addUnseenRequest(request: SimpleNotif): void {
    const unseenRequests = this.unseenRequestsSubject.getValue();
    const isDuplicate = unseenRequests.some(
      (req) => req.senderId === request.senderId && req.receiverId === request.receiverId
    );
    if (!isDuplicate) {
      this.unseenRequestsSubject.next([...unseenRequests, request]);
    }
  }

  setUnseenRequest(requests: SimpleNotif[]): void {
    this.unseenRequestsSubject.next(requests);
  }

  removeUnseenMessage(senderId: string, receiverId: string): void {
    const updatedMessages = this.unseenMessagesSubject.getValue()
      .filter(msg => !(msg.senderId === senderId && msg.receiverId === receiverId));
    this.unseenMessagesSubject.next(updatedMessages);
  }

  removeUnseenRequest(senderId: string, receiverId: string): void {
    const updatedRequests = this.unseenRequestsSubject.getValue()
      .filter(req => !(req.senderId === senderId && req.receiverId === receiverId));
    this.unseenRequestsSubject.next(updatedRequests);
  }

  resetUnseenRequest(): void {
    const emptyRequests: SimpleNotif[] = [];
    this.unseenRequestsSubject.next(emptyRequests);
  }

  resetUnseenMessages(): void {
    const emptyMessages: SimpleNotif[] = [];
    this.unseenMessagesSubject.next(emptyMessages);
  }

  getUnseenMessages(): SimpleNotif[] {
    return this.unseenMessagesSubject.getValue();
  }

  getUnseenRequests(): SimpleNotif[] {
    return this.unseenRequestsSubject.getValue();
  }
}
