import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '@/lib/store';

export interface MessageType {
  name: string;
  id: string;
  createdAt: Date;
  profileType: string;
  profileData: string;
};

export interface MessageChatType {
  id: number,
  sendedUserTag: string,
  sendedUserName?: string,
  sendedUserImage: string;
  contentType: string,
  content: string,
  isPinned: boolean,
  sendedAt: Date
}

interface MessageDataState {
  allowedMessages: MessageType[];
  notAllowedMessages: MessageType[];
  messageChats: {
    messageId: string;
    chats: MessageChatType[]
  }[]
}

const initialState: MessageDataState = {
  allowedMessages: [],
  notAllowedMessages: [],
  messageChats: []
}

export const messageDataSlice = createSlice({
  name: 'messageData',
  initialState,
  reducers: {
    setAllowedMessages: (state, action: PayloadAction<MessageType[]>) => {
      state.allowedMessages = action.payload;
    },
    setNotAllowedMessages: (state, action: PayloadAction<MessageType[]>) => {
      state.notAllowedMessages = action.payload;
    },
    addMessageChat: (state, action: PayloadAction<{
      messageId: string;
      chats: MessageChatType[];
    }>) => {
      state.messageChats.push(action.payload);
    },
    clearMessageChats: state => {
      state.messageChats = [];
    }
  }
})

export const { setAllowedMessages, setNotAllowedMessages, addMessageChat, clearMessageChats } = messageDataSlice.actions

export const getAllowedMessages = (state: RootState, messageId?: string) => {
  if(messageId) {
    return state.messageData.allowedMessages.find(allowedMessage => allowedMessage.id === messageId);
  } else {
    return state.messageData.allowedMessages
  }
}

export const getNotAllowedMessages = (state: RootState, messageId?: string) => {
  if(messageId) {
    return state.messageData.notAllowedMessages.find(notAllowedMessage => notAllowedMessage.id === messageId);
  } else {
    return state.messageData.notAllowedMessages
  }
}

export const getMessageChat = (state: RootState, messageId: string) => {
  return state.messageData.messageChats.find(messageChat => messageChat.messageId === messageId);
}

export default messageDataSlice.reducer