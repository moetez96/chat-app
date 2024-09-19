import {Component, OnInit} from '@angular/core';
import {Friend} from "../../models/Friend";
import {FriendsService} from "../../services/friends.service";

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.css'
})
export class ContactsComponent implements OnInit{

  searchText: string = "";
  contactsList: Friend[] = [];

  constructor(private friendsService: FriendsService ) {
  }

  searchContacts() {
    console.log(this.searchText);
    this.searchText = "";
  }

  ngOnInit() {
    this.fetchContacts();
  }

  fetchContacts() {
    this.friendsService.getAllContacts().subscribe({
        next: (contacts) => {
          this.contactsList = contacts;
        },
        error: (error) => {
          console.error('Error fetching data:', error.status);
        }
      }
    );
  }

  addContact(contactId: string) {
    this.friendsService.addFriend(contactId).subscribe({
      next: (contacts) => {
        this.contactsList = contacts;
      },
      error: (error) => {
        console.error('Error fetching data:', error.status);
      }
    });
  }
}
