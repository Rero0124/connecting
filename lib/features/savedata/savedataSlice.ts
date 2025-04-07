import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/lib/store'
import { Prisma } from '@prisma/client';

interface savedataState {
  initLoad: boolean;
  selectedFriends?: string;
  rooms: Prisma.RoomSelect[];
  friends: Prisma.UserSelect[];
}

const initialState: savedataState = {
  initLoad: false,
  rooms: [],
  friends: []
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
    setSelectedFriends: (state, action: PayloadAction<string>) => {
      state.selectedFriends = action.payload
    }
  }
})

export const { setInitLoadEnd, setRooms, setFriends, setSelectedFriends } = savedataSlice.actions

export const initLoadNow = (state: RootState) => state.savedata.initLoad

export default savedataSlice.reducer