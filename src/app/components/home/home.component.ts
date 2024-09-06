import {Component, OnDestroy, OnInit} from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CurrentUser } from '../../models/CurrentUser';
import { FriendsService } from '../../services/friends.service';
import { Friend } from '../../models/Friend';
import { forkJoin } from 'rxjs';
import {WebSocketService} from "../../socket/WebSocketService";


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit, OnDestroy {
  currentUser: CurrentUser | null = null;
  friendsList: Friend[] = [];
  public interval: number = 1;

  constructor(private authService: AuthService,
              private friendsService: FriendsService,
              private webSocketService: WebSocketService) {
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    forkJoin({
      friends: this.friendsService.getFriends(),
      unseenMessages: this.friendsService.getUnseenMessages()
    }).subscribe({
      next: ({ friends, unseenMessages }) => {
        if (unseenMessages && unseenMessages.length > 0) {
          unseenMessages.forEach((u: any) => {
            const friend = friends.find(f => f.connectionId === u.fromUser);
            if (friend) {
              friend.unSeen = u.count;
            }
          });
        }
        this.friendsList = friends;
        console.log(this.friendsList);
      },
      error: (error) => {
        console.error('Error fetching data:', error.status);
      }
    });

    const token = this.authService.getToken();
    const url = 'ws://127.0.0.1:8080/ws';

    this.webSocketService.connect(url, token);
  }

  ngOnDestroy() {
    this.webSocketService.disconnect();
  }

}
