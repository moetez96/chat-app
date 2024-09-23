import {Component, OnDestroy, OnInit} from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {WebSocketService} from "./socket/WebSocketService";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  showNavbar = true;

  constructor(private router: Router, private webSocketService: WebSocketService) {}

  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.showNavbar = !(event.url === '/login' || event.url === '/register');
      }
    });
  }

  ngOnDestroy() {
    this.webSocketService.disconnect();
  }
}
