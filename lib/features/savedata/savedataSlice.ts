import { createSlice, Middleware, PayloadAction } from '@reduxjs/toolkit'
import { Prisma } from '@prisma/client';
import { getCookieValue } from '@/lib/util';

interface savedataState {
  initLoad: boolean;
  selectedFriend?: string;
  selectedMessage?: string;
  title: string;
  rooms: Prisma.RoomSelect[];
  friends: Prisma.UserSelect[];
  navSize: number;
}

const oldSavedata: { 
  selectedFriend?: string;
  selectedMessage?: string;
  navSize: number;
} = JSON.parse(getCookieValue('savedata') ?? '{}')

const initialState: savedataState = {
  initLoad: false,
  title: '',
  rooms: [],
  friends: [],
  navSize: oldSavedata.navSize ?? 200,
  selectedFriend: oldSavedata.selectedFriend,
  selectedMessage: oldSavedata.selectedMessage
}

export const savedataSlice = createSlice({
  name: 'savedata',
  initialState,
  reducers: {
    setInitLoadEnd: state => {
      state.initLoad = true
    },
    setRooms: (state, action: PayloadAction<Prisma.RoomSelect[]>) => {
      state.rooms = action.payload
    },
    setFriends: (state, action: PayloadAction<Prisma.UserSelect[]>) => {
      state.friends = action.payload
    },
    setTitle: (state, action: PayloadAction<string>) => {
      state.title = action.payload
    },
    setNavSize: (state, action: PayloadAction<number>) => {
      state.navSize = action.payload
    },
    setSelectedFriend: (state, action: PayloadAction<string>) => {
      state.selectedFriend = action.payload
    },
    setSelectedMessage: (state, action: PayloadAction<string>) => {
      state.selectedMessage = action.payload
    }
  }
})

export const { setInitLoadEnd, setRooms, setFriends, setTitle, setNavSize, setSelectedFriend } = savedataSlice.actions

export const setCookieBySaveData: Middleware = state => next => action => {
  next(action)
  const { selectedFriend, selectedMessage, navSize } = state.getState().savedata
  document.cookie = 'savedata=' + JSON.stringify({ selectedFriend, selectedMessage, navSize })
}

export default savedataSlice.reducer