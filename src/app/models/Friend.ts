import {ChatMessage} from "./ChatMessage";

export interface Friend {
  connectionId: string;
  connectionUsername: string;
  convId: string;
  isOnline: boolean;
  unSeen: number;
  avatar: string;
  lastMessage: ChatMessage;
}
