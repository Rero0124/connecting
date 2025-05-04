import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '@/src/lib/store'
import { RoomDetail, RoomList, RoomMessageDetail } from '@/src/types/api'

interface RoomDataState {
	rooms: RoomList
	roomDetails: Record<string, RoomDetail>
}

const initialState: RoomDataState = {
	rooms: [],
	roomDetails: {},
}

export const roomDataSlice = createSlice({
	name: 'roomData',
	initialState,
	reducers: {
		setRooms: (state, action: PayloadAction<RoomList>) => {
			state.rooms = action.payload
		},
		setRoomDetail: (state, action: PayloadAction<RoomDetail>) => {
			const key = action.payload.id
			state.roomDetails[key] = action.payload
		},
		removeRoomDetail: (state, action: PayloadAction<string>) => {
			delete state.roomDetails[action.payload]
		},
		addRoomMessage: (state, action: PayloadAction<RoomMessageDetail>) => {
			const key = action.payload.roomId
			state.roomDetails[key].message.push(action.payload)
		},
	},
})

export const { setRooms, setRoomDetail, removeRoomDetail, addRoomMessage } =
	roomDataSlice.actions

export const getRooms = (state: RootState, roomId?: string) => {
	if (roomId) {
		return state.roomDate.rooms.find((room) => room.id === roomId)
	} else {
		return state.roomDate.rooms
	}
}

export default roomDataSlice.reducer
