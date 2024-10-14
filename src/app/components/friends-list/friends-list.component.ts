import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { Friend } from '../../models/Friend';
import {NotificationHandlerService} from "../../shared/notification-handler.service";

@Component({
  selector: 'app-friends-list',
  templateUrl: './friends-list.component.html',
  styleUrls: ['./friends-list.component.css']
})
export class FriendsListComponent implements OnInit, OnChanges {

  @Input() friendsList: Friend[] = [];
  @Input() selectedId!: string | null;
  @Output() handleSelectedFriend = new EventEmitter<Friend>();
  convId: string | null = null;

  constructor(private notificationHandlerService: NotificationHandlerService) {}

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    let selectedIdChanged = changes['selectedId'] && changes['selectedId'].currentValue !== null;

    if (changes['friendsList']) {
      this.notificationHandlerService.resetUnseenMessages();
    }

    if (changes['friendsList'] || selectedIdChanged) {
      if (this.selectedId && this.friendsList.length > 0) {
        const friend = this.friendsList.find(friend => friend.connectionId === this.selectedId);
        if (friend) {
          this.convId = friend.convId;
        } else {
          this.convId = null;
        }
      } else {
        this.convId = null;
      }
    }
  }

  selectConversation(friend: Friend): void {
    this.convId = friend.convId;
    this.handleSelectedFriend.emit(friend);
  }
}
