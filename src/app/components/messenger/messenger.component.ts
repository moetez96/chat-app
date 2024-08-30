import {Component, Input} from '@angular/core';
import {Friend} from "../../models/Friend";

@Component({
  selector: 'app-messenger',
  templateUrl: './messenger.component.html',
  styleUrl: './messenger.component.css'
})
export class MessengerComponent {

  @Input()
  friendsList: Friend[] = [];

  constructor() {
  }
}
