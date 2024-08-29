import { Component } from '@angular/core';

@Component({
  selector: 'app-messenger',
  templateUrl: './messenger.component.html',
  styleUrl: './messenger.component.css'
})
export class MessengerComponent {
  contacts = Array(25).fill(0);
}
