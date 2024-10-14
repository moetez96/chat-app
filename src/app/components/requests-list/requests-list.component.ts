import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import { MessageService } from "../../shared/message.service";
import { FriendRequest } from "../../models/FriendRequest";
import {FriendsRequestService} from "../../services/friends-request.service";
import {NotificationHandlerService} from "../../shared/notification-handler.service";

@Component({
  selector: 'app-requests-list',
  templateUrl: './requests-list.component.html',
  styleUrl: './requests-list.component.css'
})
export class RequestsListComponent implements OnInit, OnChanges {

  @Input()  requestsList: FriendRequest[] = [];
  @Output() updateRequests = new EventEmitter<FriendRequest[]>();

  constructor(private friendsRequestService: FriendsRequestService,
              private notificationHandlerService: NotificationHandlerService) {

  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['requestsList']) {
      this.friendsRequestService.seeFriendsRequests().subscribe({
        next:((res) => {}),
        error:((error) => console.log(error))
      });
      this.notificationHandlerService.resetUnseenRequest();
    }
  }
}
