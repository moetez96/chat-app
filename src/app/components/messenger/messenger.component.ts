import { Component, OnDestroy, OnInit, HostListener } from '@angular/core';
import { Friend } from "../../models/Friend";
import { WebSocketService } from "../../socket/WebSocketService";
import { MessageService } from '../../shared/message.service';
import { Subscription } from "rxjs";
import { FriendRequestHandlerService } from "../../shared/friend-request-handler.service";
import { FriendsListHandlerService } from "../../shared/friends-list-handler.service";
import { FriendRequest } from "../../models/FriendRequest";
import { ActivatedRoute, Router } from "@angular/router";
import { FriendsService } from "../../services/friends.service";

@Component({
  selector: 'app-messenger',
  templateUrl: './messenger.component.html',
  styleUrls: ['./messenger.component.css']
})
export class MessengerComponent implements OnInit, OnDestroy {

  requestsList: FriendRequest[] = [];
  friendsList: Friend[] = [];

  allRequestsList: FriendRequest[] = [];
  allFriendsList: Friend[] = [];

  selectedFriend: Friend | null = null;
  selectedTab: string = 'friends';
  awaitingUnseenMessagesCount: number = 0;
  searchText: string = "";
  selectedId: string | null = null;

  expand: boolean = false;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private webSocketService: WebSocketService,
    private friendRequestHandlerService: FriendRequestHandlerService,
    private messageService: MessageService,
    private friendsListHandlerService: FriendsListHandlerService,
    private friendsService: FriendsService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRequests();
    this.loadFriends();
    this.subscribeToMessages();
    this.subscribeToRequestsList();
    this.checkScreenWidth();

    window.addEventListener('resize', this.checkScreenWidth.bind(this));

    this.route.paramMap.subscribe(params => {
      this.selectedId = params.get('id');
      if (this.selectedId) {
        this.friendsService.getFriendById(this.selectedId).subscribe({
          next: ((friend) => {
            this.selectedFriend = friend;
          }),

          error: ((error) => {
            console.log(error);
          })
        })
      } else {
        if(window.innerWidth <= 768) {
          this.expand = true;
        }
        console.log("No ID provided, default view");
      }
    });
  }

  ngOnDestroy(): void {

    this.subscriptions.unsubscribe();
    window.removeEventListener('resize', this.checkScreenWidth.bind(this));
  }

  checkScreenWidth(): void {
    this.expand = window.innerWidth > 768;
  }

  changeExpand(): void {
    this.expand = !this.expand;
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
          this.friendsListHandlerService.handleIncomingMessage(message);
        }
      })
    );

    this.friendsListHandlerService.friendsList$.subscribe(friends => {
      this.friendsList = this.friendsListHandlerService.sortFriends(friends);
      this.allFriendsList = this.friendsList;
      this.awaitingUnseenMessagesCount = friends.filter((friend) => friend.unSeen > 0).length;
    });
  }

  subscribeToRequestsList(): void {
    this.subscriptions.add(
      this.friendRequestHandlerService.requestsList$.subscribe(requests => {
        this.requestsList = requests;
        this.allRequestsList = requests;
      })
    );
  }

  friendSeenCounterUpdate(updatedFriend: Friend) {
    this.selectedFriend = updatedFriend;
    this.friendsListHandlerService.updateFriend(updatedFriend);
  }

  selectTab(tab: string) {
    this.selectedTab = tab;

    if (tab === 'requests') {
      this.messageService.resetUnseenRequest();
      this.loadRequests();
    }

    if (tab === 'friends') {
      this.messageService.resetUnseenMessages();
      this.loadFriends();
    }

    this.searchText = "";
  }

  get unseenRequestsCount(): number {
    return this.messageService.getUnseenRequests().length;
  }

  get unseenMessagesCount(): number {
    return this.messageService.getUnseenMessages().length;
  }

  handleSelectedFriend(selectedFriend: Friend): void {
    if (selectedFriend && selectedFriend.connectionId) {
      if (window.innerWidth < 768) {
        this.expand = false;
      }
      this.router.navigate(['/messenger', selectedFriend.connectionId]);
    }
  }

  handleUpdateAwaitingRequest(requests: any) {
    this.requestsList = requests;
  }

  search() {
    console.log(this.searchText);
    if (this.searchText.trim()) {
      if (this.selectedTab === 'requests') {
        this.requestsList = this.allRequestsList.filter((request) =>
          request.sender.connectionUsername.toLowerCase().includes(this.searchText.toLowerCase())
        );
      } else if (this.selectedTab === 'friends') {
        this.friendsList = this.allFriendsList.filter((friend) =>
          friend.connectionUsername.toLowerCase().includes(this.searchText.toLowerCase())
        );
      }
    } else {
      this.loadRequests();
      this.loadFriends();
    }
  }

  private loadFriends() {
    this.friendsListHandlerService.loadFriendsAndUnseenMessages();
  }
}
