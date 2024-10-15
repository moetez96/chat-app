import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LoginComponent} from "./components/pages/login/login.component";
import {RegisterComponent} from "./components/pages/register/register.component";
import {AuthGuard} from "./guards/auth.guard";
import {MessengerComponent} from "./components/pages/messenger/messenger.component";
import {ContactsComponent} from "./components/pages/contacts/contacts.component";

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent},
  { path: 'messenger/:id', component: MessengerComponent, canActivate: [AuthGuard] },
  { path: 'messenger', component: MessengerComponent, canActivate: [AuthGuard] },
  { path: 'contacts', component: ContactsComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: 'messenger', pathMatch: 'full' },
  { path: '**', redirectTo: '/contacts' }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
