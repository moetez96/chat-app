  import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
  import {Friend} from "../../models/Friend";

  @Component({
    selector: 'app-messenger',
    templateUrl: './messenger.component.html',
    styleUrl: './messenger.component.css'
  })
  export class MessengerComponent implements OnInit, OnChanges{

    @Input()
    friendsList: Friend[] = [];

    selectedFriend: Friend | null = null;

    constructor() {
    }

    ngOnInit() {
      if (this.friendsList.length > 0) {
        this.selectedFriend = this.friendsList[0];
      } else {
        console.log("Friends List is empty");
      }
    }

    ngOnChanges(changes: SimpleChanges) {
      if (changes['friendsList'] && changes['friendsList'].currentValue.length > 0) {
        if (!this.selectedFriend) {
          this.selectedFriend = changes['friendsList'].currentValue[0];
          console.log('selectedConvId updated:', this.selectedFriend);
        }
      }
    }

    selectConversation(selectedFriend: Friend) {
      this.selectedFriend = selectedFriend;
    }
  }
