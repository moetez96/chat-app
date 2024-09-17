import {MessageType} from "./enums/MessageType";
import {MessageDeliveryStatusEnum} from "./enums/MessageDeliveryStatusEnum";
import {UserConnection} from "./UserConnection";
import {MessageDeliveryStatusUpdate} from "./MessageDeliveryStatusUpdate";

export interface ChatMessage {
  id: string;
  content: string;
  messageType: MessageType;
  senderId: string;
  senderUsername: string;
  receiverId: string;
  receiverUsername: string;
  userConnection: UserConnection;
  messageDeliveryStatusEnum: MessageDeliveryStatusEnum;
  messageDeliveryStatusUpdates: MessageDeliveryStatusUpdate[];
  time: Date;
}
