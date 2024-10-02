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
import {MessageService} from "../../shared/message.service";

@Component({
  selector: 'app-friends-list',
  templateUrl: './friends-list.component.html',
  styleUrls: ['./friends-list.component.css']
})
export class FriendsListComponent implements OnInit, OnChanges {

  @Input() selectedFriend: Friend | null = null;
  @Input() friendsList: Friend[] = [];

  @Output() handleSelectedFriend = new EventEmitter<Friend>();

  constructor(private messageService: MessageService) {}

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['friendsList']) {
      this.messageService.resetUnseenMessages();
    }
  }

  selectConversation(friend: Friend): void {
    this.selectedFriend = friend;
    this.handleSelectedFriend.emit(friend);
  }
}
