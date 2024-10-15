import { Injectable } from '@angular/core';
import {BehaviorSubject, combineLatest} from "rxjs";
import {Friend} from "../models/Friend";
import {FriendsRequestService} from "../services/friends-request.service";
import {FriendsService} from "../services/friends.service";
import {FriendRequestHandlerService} from "./friend-request-handler.service";
import {ToastrService} from "ngx-toastr";
import {AuthService} from "../services/auth.service";
import {NotificationHandlerService} from "./notification-handler.service";
import {MessageType} from "../models/enums/MessageType";
import {ChatMessage} from "../models/ChatMessage";

@Injectable({
  providedIn: 'root'
})
export class ContactsHandlerService {

  private loadingSubject = new BehaviorSubject<boolean>(false);
  private requestLoadingSubject = new BehaviorSubject<string | null>(null);
  private contactsListSubject = new BehaviorSubject<Friend[]>([]);
  contactsList$ = this.contactsListSubject.asObservable();

  constructor(private friendsRequestService: FriendsRequestService,
              private friendsService: FriendsService,
              private friendRequestHandlerService: FriendRequestHandlerService,
              private notificationHandlerService: NotificationHandlerService,
              private authService: AuthService,
              private toastr: ToastrService) {

  }

  getLoadingContacts(): boolean {
    return this.loadingSubject.getValue();
  }

  getRequestLoading(): string | null {
    return this.requestLoadingSubject.getValue();
  }

  fetchContacts() {
    this.loadingSubject.next(true);
    combineLatest([
      this.friendsRequestService.getReceivedRequests(),
      this.friendsRequestService.getSentRequests(),
      this.friendsService.getAllContacts(),
      this.friendsService.getFriends(),
    ]).subscribe({
      next: ([receivedRequests, sentRequests, contacts, friends]) => {
        const contactsList = contacts.filter((contact) =>
          !friends.some((fr) => fr.connectionId === contact.connectionId)
        );

        this.contactsListSubject.next(contactsList);
        this.friendRequestHandlerService.setReceivedRequests(receivedRequests);
        this.friendRequestHandlerService.setSentRequests(sentRequests);
        },
      error: (error) => {
        this.loadingSubject.next(false);
        this.toastr.error('Error fetching data', 'Server error');
        console.error('Error fetching data:', error.status);
      },
      complete: () => {
        this.loadingSubject.next(false);
      }
    });
  }

  handleContactsMessage(message: ChatMessage) {
    if (message.messageType === MessageType.FRIEND_REQUEST_ACCEPTED) {
      this.removeAcceptedFriend(message.senderId);
    }
  }

  removeAcceptedFriend(senderId: string) {
    let contactsList = this.contactsListSubject.getValue();
    const updatedContactsList = contactsList.filter(friend => friend.connectionId !== senderId);
    this.contactsListSubject.next(updatedContactsList);
  }

  acceptContact(contactId: string) {
    const currentUser = this.authService.getCurrentUser();
    this.requestLoadingSubject.next(contactId);

    return this.friendsRequestService.acceptFriendRequest(contactId).subscribe({
      next: (friendRequest) => {
        if (currentUser) {
          const contactsList = this.contactsListSubject.getValue();
          const updatedContactsList = contactsList.filter((friend) => friend.connectionId != contactId);
          this.contactsListSubject.next(updatedContactsList);
          this.notificationHandlerService.removeUnseenRequest(contactId, currentUser.id);
        }

        this.requestLoadingSubject.next(null);
      },
      error: (error) => {
        this.toastr.error('Error sending request, Try again later', 'Server error');
        this.requestLoadingSubject.next(null);
      }
    });
  }

  addContact(contactId: string) {
    this.requestLoadingSubject.next(contactId);

    this.friendsRequestService.sendRequest(contactId).subscribe({
      next: (friendRequest) => {
        let sentRequests = this.friendRequestHandlerService.getSentRequests();
        this.friendRequestHandlerService.setSentRequests([... sentRequests, friendRequest]);
        this.requestLoadingSubject.next(null);
      },
      error: (error) => {
        this.toastr.error('Error accepting request, Try again later', 'Server error');
        this.requestLoadingSubject.next(null);
        console.error('Error sending request:', error.status);
      }
    });
  }

  cancelRequest(contactId: string) {
    this.requestLoadingSubject.next(contactId);

    this.friendsRequestService.cancelFriendRequest(contactId).subscribe({
      next: (response) => {
        let sentRequests = this.friendRequestHandlerService.getSentRequests();
        const updatedSentRequests = sentRequests.filter((req) => req.receiver.connectionId !== contactId);
        this.friendRequestHandlerService.setSentRequests(updatedSentRequests);
        this.requestLoadingSubject.next(null);
      },
      error: (error) => {
        this.toastr.error('Error canceling request, Try again later', 'Server error');
        this.requestLoadingSubject.next(null);
        console.error('Error canceling request:', error.status);
      }
    });
  }

  declineRequest(contactId: string) {
    this.requestLoadingSubject.next(contactId);

    this.friendsRequestService.declineFriendRequest(contactId).subscribe({
      next: (response) => {
        let receivedRequests = this.friendRequestHandlerService.getReceivedRequests();
        const updatedReceivedRequests = receivedRequests.filter((req) => req.sender.connectionId !== contactId)
        this.friendRequestHandlerService.setReceivedRequests(updatedReceivedRequests);
        this.requestLoadingSubject.next(null);
      },
      error: (error) => {
        this.toastr.error('Error declining request, Try again later', 'Server error');
        this.requestLoadingSubject.next(null);
        console.error('Error declining request:', error.status);
      }
    });
  }
}
