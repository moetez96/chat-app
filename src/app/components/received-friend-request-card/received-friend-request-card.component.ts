import {Component, Input} from '@angular/core';
import {FriendRequest} from "../../models/FriendRequest";
import {AuthService} from "../../services/auth.service";
import {FriendsRequestService} from "../../services/friends-request.service";

@Component({
  selector: 'app-received-friend-request-card',
  templateUrl: './received-friend-request-card.component.html',
  styleUrl: './received-friend-request-card.component.css'
})
export class ReceivedFriendRequestCardComponent {

  @Input()
  request!: FriendRequest

  constructor(private authService: AuthService, private friendsRequestService: FriendsRequestService) {
  }

  acceptRequest() {
    this.friendsRequestService.acceptFriendRequest(this.request.sender.connectionId).subscribe({
      next: ((response) => {
        console.log(response);
      }),
      error: ((err) => console.log(err)),
    });
  }

  declineRequest() {
    this.friendsRequestService.declineFriendRequest(this.request.sender.connectionId).subscribe({
      next: ((response) => {
        console.log(response);
      }),
      error: ((err) => console.log(err)),
    });
  }
}
