import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import { Friend } from "../../../models/Friend";
import { WebSocketService } from "../../../socket/WebSocketService";
import { MessageService } from '../../../shared/message.service';
import { Subscription} from "rxjs";
import { FriendRequestHandlerService } from "../../../shared/friend-request-handler.service";
import { FriendsListHandlerService } from "../../../shared/friends-list-handler.service";
import { FriendRequest } from "../../../models/FriendRequest";
import { ActivatedRoute, Router } from "@angular/router";
import { FriendsService } from "../../../services/friends.service";
import {PollingService} from "../../../shared/polling.service";
import {NotificationHandlerService} from "../../../shared/notification-handler.service";

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

  selectedTab: string = 'friends';
  searchText: string = "";
  selectedId: string | null = null;

  expand: boolean = false;
  loading: boolean = true;

  awaitingUnseenMessagesCount: number = 0;
  unseenMessagesCount: number = 0;
  unseenRequestsCount: number = 0

  isServerReady: boolean = false;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private webSocketService: WebSocketService,
    private friendRequestHandlerService: FriendRequestHandlerService,
    private messageService: MessageService,
    private notificationHandlerService: NotificationHandlerService,
    private friendsListHandlerService: FriendsListHandlerService,
    private friendsService: FriendsService,
    private pollingService: PollingService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  async ngOnInit() {
    this.checkScreenWidth();
    window.addEventListener('resize', this.checkScreenWidth.bind(this));

    this.subscriptions.add(
      this.notificationHandlerService.unseenMessages$.subscribe(unseen => {
        this.unseenMessagesCount = unseen.length;
        this.cdr.detectChanges();
      })
    );

    this.subscriptions.add(
      this.notificationHandlerService.unseenRequests$.subscribe(unseen => {
        this.unseenRequestsCount = unseen.length;
        this.cdr.detectChanges();
      })
    );

    this.subscriptions.add(
      this.pollingService.isServerReady$.subscribe(isReady => {
        this.isServerReady = isReady;
        if (isReady) {
          this.loadRequests();
          this.loadFriends();
          this.subscribeToFriendsList();
          this.subscribeToRequestsList();

          this.route.paramMap.subscribe(params => {
            this.selectedId = params.get('id');

            if (!this.selectedId) {
              if(window.innerWidth <= 768) {
                this.expand = true;
              }
            }
          });
        }
      })
    );
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
    this.loading = true;
    this.subscriptions.add(
      this.friendRequestHandlerService.loadReceivedRequests().subscribe(() => {
        this.loading = false;
      })
    );
  }

  subscribeToFriendsList(): void {
    this.subscriptions.add(
      this.friendsListHandlerService.friendsList$.subscribe(friends => {
        if (this.selectedId) {
          let friend = friends.find(friend => friend.connectionId === this.selectedId);
          if (friend) {
            friend.unSeen = 0;
          }
        }
        this.friendsList = this.friendsListHandlerService.sortFriends(friends);
        this.allFriendsList = this.friendsList;
        this.awaitingUnseenMessagesCount = friends.filter((friend) => friend.unSeen > 0).length;
      })
    );
  }

  subscribeToRequestsList(): void {
    this.subscriptions.add(
      this.friendRequestHandlerService.requestsList$.subscribe(requests => {
        this.requestsList = requests;
        this.allRequestsList = requests;
      })
    );
  }

  async selectTab(tab: string) {
    this.selectedTab = tab;

    if (tab === 'requests') {
      this.notificationHandlerService.resetUnseenRequest();
      this.loadRequests();
    }

    if (tab === 'friends') {
      this.notificationHandlerService.resetUnseenMessages();
      await this.loadFriends();
    }

    this.searchText = "";
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

  async search() {

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
      await this.loadFriends();
    }
  }

  private async loadFriends() {
    this.loading = true;
    try {
      await this.friendsListHandlerService.loadFriendsAndUnseenMessages();
    } catch (error) {
      console.error('Error loading friends and unseen messages:', error);
    } finally {
      this.loading = false;
    }
  }
}
