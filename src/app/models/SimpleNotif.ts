import {NotificationType} from "./enums/NotificationType";

export interface SimpleNotif {
  senderId: string;
  senderUsername: string;
  receiverId: string;
  receiverUsername: string;
  notificationType: NotificationType;
}
