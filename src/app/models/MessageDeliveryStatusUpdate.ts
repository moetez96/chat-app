import {MessageDeliveryStatusEnum} from "./enums/MessageDeliveryStatusEnum";

export interface MessageDeliveryStatusUpdate {
  id: string;
  content: string;
  messageDeliveryStatusEnum: MessageDeliveryStatusEnum
}
