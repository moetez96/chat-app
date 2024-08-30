import {Component, Input} from '@angular/core';
import {Friend} from "../../models/Friend";

@Component({
  selector: 'app-contact-card',
  templateUrl: './contact-card.component.html',
  styleUrl: './contact-card.component.css'
})
export class ContactCardComponent {

  @Input()
  friend!: Friend;

  constructor() {
  }

}
