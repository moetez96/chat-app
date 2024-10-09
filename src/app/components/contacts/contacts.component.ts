import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {Friend} from "../../models/Friend";
import {FriendsService} from "../../services/friends.service";
import {FriendsRequestService} from "../../services/friends-request.service";
import {FriendRequest} from "../../models/FriendRequest";
import {forkJoin} from "rxjs";
import {MessageService} from "../../shared/message.service";
import {MessageType} from "../../models/enums/MessageType";
import {AuthService} from "../../services/auth.service";
import {CurrentUser} from "../../models/CurrentUser";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.css']
})
export class ContactsComponent implements OnInit {

  searchText: string = "";
  contactsList: Friend[] = [];
  allContactsList: Friend[] = [];
  receivedRequests: FriendRequest[] = [];
  sentRequests: FriendRequest[] = [];
  currentUser!: CurrentUser | null;
  loading: boolean = true;
  requestLoading: string | null = null;

  constructor(
    private authService: AuthService,
    private friendsService: FriendsService,
    private friendsRequestService: FriendsRequestService,
    private messageService: MessageService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.fetchContacts();
    this.messageService.message$.subscribe(message => {
      if (message) {
        switch (message.messageType) {
          case MessageType.FRIEND_REQUEST:
            this.receivedRequests = this.messageService.addFriendRequest(this.receivedRequests, message);
            break;

          case MessageType.FRIEND_REQUEST_ACCEPTED:
            this.toastr.info(message.senderUsername + ' accepted your friend request', 'Accepted friend request');
            this.messageService.removeUnseenRequest(message.receiverId, message.senderId);
            this.contactsList = this.messageService.removeAcceptedFriend(this.contactsList, message);
            this.allContactsList = this.contactsList;
            break;

          case MessageType.FRIEND_REQUEST_DECLINED:
            this.messageService.removeUnseenRequest(message.receiverId, message.senderId);
            this.sentRequests = this.messageService.removeDeclinedFriendRequest(this.sentRequests, message);
            break;

          case MessageType.FRIEND_REQUEST_CANCELED:
            this.receivedRequests = this.messageService.removeCanceledFriendRequest(this.receivedRequests, message);
            break;
        }
      }
    });
  }

  searchContacts() {

    if (this.searchText.trim()) {
      this.contactsList = this.allContactsList.filter((request) =>
        request.connectionUsername.toLowerCase().includes(this.searchText.toLowerCase())
      );
    } else {
      this.fetchContacts();
    }
  }

  fetchContacts() {
    forkJoin({
      receivedRequests: this.friendsRequestService.getReceivedRequests(),
      sentRequests: this.friendsRequestService.getSentRequests(),
      contacts: this.friendsService.getAllContacts(),
      friends: this.friendsService.getFriends(),
    }).subscribe({
      next: ({ receivedRequests,
               sentRequests,
               contacts,
               friends }) => {

        this.contactsList = contacts.filter((contact) =>
          !friends.map((fr) => fr.connectionId).includes(contact.connectionId)
        );
        this.allContactsList = this.contactsList;
        this.receivedRequests = receivedRequests;
        this.sentRequests = sentRequests;

        this.cdr.markForCheck();
      },
      error: (error) => {
        this.loading = false;
        this.toastr.error('Error fetching data', 'Server error');
        console.error('Error fetching data:', error.status);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  acceptContact(contactId: string) {
    this.requestLoading = contactId;
    this.friendsRequestService.acceptFriendRequest(contactId).subscribe({
      next: (friendRequest) => {
        if (this.currentUser) {
          this.contactsList = this.contactsList.filter((friend) => friend.connectionId != contactId);
          this.allContactsList = this.contactsList;
          this.messageService.removeUnseenRequest(contactId, this.currentUser.id);
        }
      },
      error: (error) => {
        this.requestLoading = null;
        this.toastr.error('Error sending request, Try again later', 'Server error');
        console.error('Error sending request:', error.status);
      },
      complete: () => {
        this.requestLoading = null;
      }
    });
  }

  addContact(contactId: string) {
    this.requestLoading = contactId;
    this.friendsRequestService.sendRequest(contactId).subscribe({
      next: (friendRequest) => {
        this.sentRequests.push(friendRequest);
      },
      error: (error) => {
        this.requestLoading = null;
        this.toastr.error('Error accepting request, Try again later', 'Server error');
        console.error('Error sending request:', error.status);
      },
      complete: () => {
        this.requestLoading = null;
      }
    });
  }

  cancelRequest(contactId: string) {
    this.requestLoading = contactId;
    this.friendsRequestService.cancelFriendRequest(contactId).subscribe({
      next: (response) => {
        this.sentRequests = this.sentRequests.filter((req) => req.receiver.connectionId !== contactId);
      },
      error: (error) => {
        this.requestLoading = null;
        this.toastr.error('Error canceling request, Try again later', 'Server error');
        console.error('Error canceling request:', error.status);
      },
      complete: () => {
        this.requestLoading = null;
      }
    });
  }

  declineRequest(contactId: string) {
    this.requestLoading = contactId;
    this.friendsRequestService.declineFriendRequest(contactId).subscribe({
      next: (response) => {
        this.receivedRequests = this.receivedRequests.filter((req) => req.sender.connectionId !== contactId);
      },
      error: (error) => {
        this.requestLoading = null;
        this.toastr.error('Error declining request, Try again later', 'Server error');
        console.error('Error declining request:', error.status);
      },
      complete: () => {
        this.requestLoading = null;
      }
    });
  }

  hasSentRequest(contactId: string): boolean {
    return this.sentRequests.some(fq => fq.receiver.connectionId == contactId);
  }

  hasReceivedRequest(contactId: string): boolean {
    return this.receivedRequests.some(rq => rq.sender.connectionId == contactId);
  }

}
