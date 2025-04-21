import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '@/lib/store';

export interface RoomType {
  name: string;
  id: string;
  sendedUserTag: string;
  createdAt: Date;
  profileType: string;
  profileData: string;
};

export interface RoomChatType {
  id: number,
  sendedUserTag: string,
  sendedUserName?: string,
  sendedUserImage: string;
  contentType: string,
  content: string,
  isPinned: boolean,
  sendedAt: Date
}

interface RoomDataState {
  rooms: RoomType[];
  roomChats: {
    roomId: string;
    chats: RoomChatType[]
  }[]
}

const initialState: RoomDataState = {
  rooms: [],
  roomChats: []
}

export const roomDataSlice = createSlice({
  name: 'roomData',
  initialState,
  reducers: {
    setRooms: (state, action: PayloadAction<RoomType[]>) => {
      state.rooms = action.payload;
    },
    addRoomChat: (state, action: PayloadAction<{
      roomId: string;
      chats: RoomChatType[];
    }>) => {
      state.roomChats.push(action.payload);
    },
    clearRoomChats: state => {
      state.roomChats = [];
    }
  }
})

export const { setRooms, addRoomChat, clearRoomChats } = roomDataSlice.actions

export const getRooms = (state: RootState, roomId?: string) => {
  if(roomId) {
    return state.roomDate.rooms.find(room => room.id === roomId);
  } else {
    return state.roomDate.rooms
  }
}

export const getRoomChat = (state: RootState, roomId: string) => {
  return state.roomDate.roomChats.find(roomChat => roomChat.roomId === roomId);
}

export default roomDataSlice.reducer