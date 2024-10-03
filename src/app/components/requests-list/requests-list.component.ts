import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import { MessageService } from "../../shared/message.service";
import { FriendRequest } from "../../models/FriendRequest";
import { Subscription } from "rxjs";
import { FriendRequestHandlerService } from "../../shared/friend-request-handler.service";
import {FriendsRequestService} from "../../services/friends-request.service";

@Component({
  selector: 'app-requests-list',
  templateUrl: './requests-list.component.html',
  styleUrl: './requests-list.component.css'
})
export class RequestsListComponent implements OnInit, OnChanges {

  @Input()  requestsList: FriendRequest[] = [];
  @Output() updateRequests = new EventEmitter<FriendRequest[]>();

  constructor(private friendsRequestService: FriendsRequestService,
              private messageService: MessageService) {

  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['requestsList']) {
      this.friendsRequestService.seeFriendsRequests().subscribe({
        next:((res) => console.log(res)),
        error:((error) => console.log(error))
      });
      this.messageService.resetUnseenRequest();
    }
  }
}
