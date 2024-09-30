import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {Friend} from "../../models/Friend";
import {FriendsService} from "../../services/friends.service";
import {FriendsRequestService} from "../../services/friends-request.service";
import {FriendRequest} from "../../models/FriendRequest";
import {forkJoin} from "rxjs";
import {MessageService} from "../../services/message.service";
import {MessageType} from "../../models/enums/MessageType";

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

  constructor(
    private friendsService: FriendsService,
    private friendsRequestService: FriendsRequestService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.fetchContacts();
    this.messageService.message$.subscribe(message => {
      if (message) {
        switch (message.messageType) {
          case MessageType.FRIEND_REQUEST:
            this.receivedRequests = this.messageService.addFriendRequest(this.receivedRequests, message);
            break;

          case MessageType.FRIEND_REQUEST_ACCEPTED:
            this.contactsList = this.messageService.removeAcceptedFriend(this.contactsList, message);
            break;

          case MessageType.FRIEND_REQUEST_DECLINED:
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
      next: ({ receivedRequests, sentRequests, contacts, friends }) => {

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
        this.contactsList = this.contactsList.filter((friend) => friend.connectionId != contactId);
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
        console.log('hello declined', this.receivedRequests);

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
