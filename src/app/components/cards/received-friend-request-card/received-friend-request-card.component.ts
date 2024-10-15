import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FriendRequest} from "../../../models/FriendRequest";
import {AuthService} from "../../../services/auth.service";
import {FriendsRequestService} from "../../../services/friends-request.service";
import {Friend} from "../../../models/Friend";
import {FriendRequestHandlerService} from "../../../shared/friend-request-handler.service";

@Component({
  selector: 'app-received-friend-request-card',
  templateUrl: './received-friend-request-card.component.html',
  styleUrl: './received-friend-request-card.component.css'
})
export class ReceivedFriendRequestCardComponent {

  @Input() request!: FriendRequest;
  loading: boolean = false;

  constructor(private authService: AuthService,
              private friendsRequestService: FriendsRequestService,
              private friendRequestHandlerService: FriendRequestHandlerService) {
  }

  acceptRequest() {
    this.loading = true;
    this.friendsRequestService.acceptFriendRequest(this.request.sender.connectionId).subscribe({
      next: ((response) => {
        this.friendRequestHandlerService.removeRequest(this.request);
      }),
      error: ((err) => {
        console.log(err);
        this.loading = false;
      }),
      complete: (() => {
        this.loading = false;
      })
    });
  }

  declineRequest() {
    this.friendsRequestService.declineFriendRequest(this.request.sender.connectionId).subscribe({
      next: ((response) => {
        this.friendRequestHandlerService.removeRequest(this.request);
      }),
      error: ((err) => {
        console.log(err)
        this.loading = false;
      }),
      complete: (() => {
        this.loading = false;
      })
    });
  }
}
