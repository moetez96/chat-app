import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FriendRequest} from "../../models/FriendRequest";
import {AuthService} from "../../services/auth.service";
import {FriendsRequestService} from "../../services/friends-request.service";
import {Friend} from "../../models/Friend";

@Component({
  selector: 'app-received-friend-request-card',
  templateUrl: './received-friend-request-card.component.html',
  styleUrl: './received-friend-request-card.component.css'
})
export class ReceivedFriendRequestCardComponent {

  @Input() request!: FriendRequest;
  @Output() requestDeclined = new EventEmitter<FriendRequest>();
  @Output() requestAccepted = new EventEmitter<FriendRequest>();

  constructor(private authService: AuthService, private friendsRequestService: FriendsRequestService) {
  }

  acceptRequest() {
    this.friendsRequestService.acceptFriendRequest(this.request.sender.connectionId).subscribe({
      next: ((response) => {
        console.log(response);
        this.requestAccepted.emit(this.request)
      }),
      error: ((err) => console.log(err)),
    });
  }

  declineRequest() {
    this.friendsRequestService.declineFriendRequest(this.request.sender.connectionId).subscribe({
      next: ((response) => {
        console.log(response);
        this.requestDeclined.emit(this.request)
      }),
      error: ((err) => console.log(err)),
    });
  }
}
