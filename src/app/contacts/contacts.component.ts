import { Component } from '@angular/core';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.css'
})
export class ContactsComponent {

  searchText: string = "";

  searchContacts() {
    console.log(this.searchText);
    this.searchText = "";
  }
}
