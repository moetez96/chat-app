import {MessageType} from "./enums/MessageType";
import {MessageDeliveryStatusEnum} from "./enums/MessageDeliveryStatusEnum";
import {UserConnection} from "./UserConnection";
import {MessageDeliveryStatusUpdate} from "./MessageDeliveryStatusUpdate";

export class ChatMessage {
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

  constructor(
    id: string,
    content: string,
    messageType: MessageType,
    senderId: string,
    senderUsername: string,
    receiverId: string,
    receiverUsername: string,
    userConnection: UserConnection,
    messageDeliveryStatusEnum: MessageDeliveryStatusEnum,
    messageDeliveryStatusUpdates: MessageDeliveryStatusUpdate[]
  ) {
    this.id = id;
    this.content = content;
    this.messageType = messageType;
    this.senderId = senderId;
    this.senderUsername = senderUsername;
    this.receiverId = receiverId;
    this.receiverUsername = receiverUsername;
    this.userConnection = userConnection;
    this.messageDeliveryStatusEnum = messageDeliveryStatusEnum;
    this.messageDeliveryStatusUpdates = messageDeliveryStatusUpdates;
  }
}
