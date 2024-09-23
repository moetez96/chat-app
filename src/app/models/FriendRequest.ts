import {UserConnection} from "./UserConnection";

export interface FriendRequest {
  id: number;
  sender: UserConnection;
  receiver: UserConnection;
  createdDate: Date;
}
