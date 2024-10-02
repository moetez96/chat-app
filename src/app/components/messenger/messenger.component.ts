import {Component, OnDestroy, OnInit} from '@angular/core';
import { Friend } from "../../models/Friend";
import { WebSocketService } from "../../socket/WebSocketService";
import { MessageService } from '../../shared/message.service';
import {Subscription} from "rxjs";
import {FriendRequestHandlerService} from "../../shared/friend-request-handler.service";

@Component({
  selector: 'app-messenger',
  templateUrl: './messenger.component.html',
  styleUrls: ['./messenger.component.css']
})
export class MessengerComponent implements OnInit, OnDestroy {

  requestsList: any[] = [];
  selectedFriend: Friend | null = null;
  selectedTab: string = 'friends';
  private subscriptions: Subscription = new Subscription();

  constructor(
    private webSocketService: WebSocketService,
    private friendRequestHandlerService: FriendRequestHandlerService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadRequests();
    this.subscribeToMessages();
    this.subscribeToRequestsList();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadRequests(): void {
    this.subscriptions.add(
      this.friendRequestHandlerService.loadReceivedRequests().subscribe()
    );
  }

  subscribeToMessages(): void {
    this.subscriptions.add(
      this.messageService.message$.subscribe(message => {
        if (message) {
          this.friendRequestHandlerService.handleMessage(message);
        }
      })
    );
  }

  subscribeToRequestsList(): void {
    this.subscriptions.add(
      this.friendRequestHandlerService.requestsList$.subscribe(requests => {
        this.requestsList = requests;
      })
    );
  }


  friendSeenCounterUpdate(updatedFriend: Friend) {
    this.selectedFriend = updatedFriend
  }

  selectTab(tab: string) {
    this.selectedTab = tab;

    if (tab === 'requests') {
      this.messageService.resetUnseenRequest();
    }

    if (tab === 'friends') {

    }
  }

  get unseenRequestsCount(): number {
    return this.messageService.getUnseenRequests().length;
  }

  get unseenMessagesCount(): number {
    return this.messageService.getUnseenMessages().length;
  }

  handleSelectedFriend(selectedFriend: Friend) {
    if (selectedFriend) {
      this.selectedFriend = selectedFriend;
    }
  }

  handleUpdateAwaitingRequest(requests: any) {
    this.requestsList = requests;
  }

  searchFriends() {
    // Implement search logic if necessary
  }
}
