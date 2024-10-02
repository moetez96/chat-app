import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { MessageService } from "../../shared/message.service";
import { FriendRequest } from "../../models/FriendRequest";
import { Subscription } from "rxjs";
import { FriendRequestHandlerService } from "../../shared/friend-request-handler.service";

@Component({
  selector: 'app-requests-list',
  templateUrl: './requests-list.component.html',
  styleUrl: './requests-list.component.css'
})
export class RequestsListComponent implements OnInit, OnDestroy {

  @Output() updateRequests = new EventEmitter<FriendRequest[]>();
  requestsList: FriendRequest[] = [];
  private subscriptions: Subscription = new Subscription();

  constructor(
    private friendRequestHandlerService: FriendRequestHandlerService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.friendRequestHandlerService.requestsList$.subscribe(requests => {
        this.requestsList = requests;
        this.messageService.resetUnseenRequest();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
