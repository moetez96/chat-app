import { Component, OnDestroy, OnInit } from '@angular/core';
import { Friend } from "../../models/Friend";
import { FriendsService } from "../../services/friends.service";
import { FriendsRequestService } from "../../services/friends-request.service";
import { FriendRequest } from "../../models/FriendRequest";
import { Subscription } from "rxjs";
import { MessageService } from "../../shared/message.service";
import { AuthService } from "../../services/auth.service";
import { CurrentUser } from "../../models/CurrentUser";
import { ToastrService } from "ngx-toastr";
import { PollingService } from "../../shared/polling.service";
import { NotificationHandlerService } from "../../shared/notification-handler.service";
import { FriendRequestHandlerService } from "../../shared/friend-request-handler.service";
import { MessageType } from "../../models/enums/MessageType";
import { ContactsHandlerService } from "../../shared/contacts-handler.service";

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.css']
})
export class ContactsComponent implements OnInit, OnDestroy {

  searchText: string = "";
  contactsList: Friend[] = [];
  allContactsList: Friend[] = [];
  receivedRequests: FriendRequest[] = [];
  sentRequests: FriendRequest[] = [];
  currentUser!: CurrentUser | null;
  loading: boolean = true;
  requestLoading: string | null = null;
  isServerReady: boolean = false;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private friendsService: FriendsService,
    private friendsRequestService: FriendsRequestService,
    private messageService: MessageService,
    private notificationHandlerService: NotificationHandlerService,
    private toastr: ToastrService,
    private pollingService: PollingService,
    private friendRequestHandlerService: FriendRequestHandlerService,
    private contactsHandlerService: ContactsHandlerService,
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();

    this.subscriptions.add(
      this.pollingService.isServerReady$.subscribe(isReady => {
        this.isServerReady = isReady;
        if (isReady) {
          this.contactsHandlerService.fetchContacts();
          this.loading = false;
        }
      })
    );

    this.subscriptions.add(
      this.friendRequestHandlerService.requestsList$.subscribe(requests => {
        this.receivedRequests = requests;
      })
    );

    this.subscriptions.add(
      this.friendRequestHandlerService.sentRequests$.subscribe(sentRequests => {
        this.sentRequests = sentRequests;
      })
    );

    this.subscriptions.add(
      this.contactsHandlerService.contactsList$.subscribe(contacts => {
        this.contactsList = contacts;
        this.allContactsList = this.contactsList;
      })
    );

    this.subscriptions.add(
      this.messageService.message$.subscribe(message => {
        if (message) {
          this.friendRequestHandlerService.handleNotificationMessage(message);

          if (message.messageType === MessageType.FRIEND_REQUEST_ACCEPTED) {
            this.contactsList = this.removeAcceptedFriend(this.contactsList, message);
            this.allContactsList = this.contactsList;
          }
        }
      })
    );
  }

  async searchContacts() {
    if (this.searchText.trim()) {
      this.contactsList = this.allContactsList.filter(contact =>
        contact.connectionUsername.toLowerCase().includes(this.searchText.toLowerCase())
      );
    } else {
      await this.resetContactsList();
    }
  }

  async resetContactsList() {
    this.loading = true;
    await this.contactsHandlerService.fetchContacts().finally(() => {
      this.loading = false;
    }
  );
  }

  async acceptContact(contactId: string) {
    this.requestLoading = contactId;
    await this.contactsHandlerService.acceptContact(contactId);
    this.requestLoading = null;
  }

  async addContact(contactId: string) {
    this.requestLoading = contactId;
    await this.contactsHandlerService.addContact(contactId);
    this.requestLoading = null;
  }

  async cancelRequest(contactId: string) {
    this.requestLoading = contactId;
    await this.contactsHandlerService.cancelRequest(contactId);
    this.requestLoading = null;
  }

  async declineRequest(contactId: string) {
    this.requestLoading = contactId;
    this.contactsHandlerService.declineRequest(contactId);
    this.requestLoading = null;
  }

  hasSentRequest(contactId: string): boolean {
    return this.sentRequests.some(request => request.receiver.connectionId === contactId);
  }

  hasReceivedRequest(contactId: string): boolean {
    return this.receivedRequests.some(request => request.sender.connectionId === contactId);
  }

  removeAcceptedFriend(contactsList: Friend[], message: any): Friend[] {
    return contactsList.filter(friend => friend.connectionId !== message.senderId);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
