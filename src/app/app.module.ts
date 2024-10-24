import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations';
import { ToastrModule, provideToastr } from 'ngx-toastr';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/pages/login/login.component';
import { RegisterComponent } from './components/pages/register/register.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { MessengerComponent } from './components/pages/messenger/messenger.component';
import { ContactCardComponent } from './components/cards/contact-card/contact-card.component';
import { ChatComponent } from './components/chat/chat.component';
import { ContactsComponent } from './components/pages/contacts/contacts.component';
import {
  ReceivedFriendRequestCardComponent
} from "./components/cards/received-friend-request-card/received-friend-request-card.component";
import {AuthInterceptor} from "./interceptors/auth-interceptor.service";
import { RequestsListComponent } from './components/requests-list/requests-list.component';
import {FriendsListComponent} from "./components/friends-list/friends-list.component";

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    NavbarComponent,
    MessengerComponent,
    ContactCardComponent,
    ChatComponent,
    ContactsComponent,
    FriendsListComponent,
    ReceivedFriendRequestCardComponent,
    RequestsListComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      closeButton: true,
      progressBar: true,
    })
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    provideAnimations(),
    provideToastr()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
