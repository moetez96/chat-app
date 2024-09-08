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

  selectedConvId: string | null = null;

  constructor() {
  }

  ngOnInit() {
    if (this.friendsList.length > 0) {
      this.selectedConvId = this.friendsList[0].convId;
    } else {
      console.log("Friends List is empty");
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['friendsList'] && changes['friendsList'].currentValue.length > 0) {
      if (!this.selectedConvId) {
        this.selectedConvId = changes['friendsList'].currentValue[0].convId;
        console.log('selectedConvId updated:', this.selectedConvId);
      }
    }
  }

  selectConversation(convId: string) {
    this.selectedConvId = convId;
  }
}
