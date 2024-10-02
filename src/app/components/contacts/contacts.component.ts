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

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.css']
})
export class ContactsComponent implements OnInit {

  searchText: string = "";
  contactsList: Friend[] = [];
  receivedRequests: FriendRequest[] = [];
  sentRequests: FriendRequest[] = [];
  currentUser!: CurrentUser | null;

  constructor(
    private authService: AuthService,
    private friendsService: FriendsService,
    private friendsRequestService: FriendsRequestService,
    private messageService: MessageService,
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
            this.messageService.removeUnseenRequest(message.receiverId, message.senderId);
            this.contactsList = this.messageService.removeAcceptedFriend(this.contactsList, message);
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
    console.log(this.searchText);
    this.searchText = "";
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
        this.receivedRequests = receivedRequests;
        this.sentRequests = sentRequests;

        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error fetching data:', error.status);
      }
    });
  }

  acceptContact(contactId: string) {
    this.friendsRequestService.acceptFriendRequest(contactId).subscribe({
      next: (friendRequest) => {
        if (this.currentUser) {
          this.contactsList = this.contactsList.filter((friend) => friend.connectionId != contactId);
          this.messageService.removeUnseenRequest(contactId, this.currentUser.id);
        }
      },
      error: (error) => {
        console.error('Error sending request:', error.status);
      }
    });
  }

  addContact(contactId: string) {
    this.friendsRequestService.sendRequest(contactId).subscribe({
      next: (friendRequest) => {
        this.sentRequests.push(friendRequest);
      },
      error: (error) => {
        console.error('Error sending request:', error.status);
      }
    });
  }

  cancelRequest(contactId: string) {
    this.friendsRequestService.cancelFriendRequest(contactId).subscribe({
      next: (response) => {
        this.sentRequests = this.sentRequests.filter((req) => req.receiver.connectionId !== contactId);
      },
      error: (error) => {
        console.error('Error canceling request:', error.status);
      }
    });
  }

  declineRequest(contactId: string) {
    this.friendsRequestService.declineFriendRequest(contactId).subscribe({
      next: (response) => {
        this.receivedRequests = this.receivedRequests.filter((req) => req.sender.connectionId !== contactId);
      },
      error: (error) => {
        console.error('Error canceling request:', error.status);
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
