import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '@/src/lib/store'
import { RoomList } from '@/src/types/api'

export interface RoomChatType {
	id: number
	sendtUserTag: string
	sendtUserName?: string
	sendtUserImage: string
	contentType: string
	content: string
	isPinned: boolean
	sendtAt: Date
}

interface RoomDataState {
	rooms: RoomList
	roomChats: {
		roomId: string
		chats: RoomChatType[]
	}[]
}

const initialState: RoomDataState = {
	rooms: [],
	roomChats: [],
}

export const roomDataSlice = createSlice({
	name: 'roomData',
	initialState,
	reducers: {
		setRooms: (state, action: PayloadAction<RoomList>) => {
			state.rooms = action.payload
		},
		addRoomChat: (
			state,
			action: PayloadAction<{
				roomId: string
				chats: RoomChatType[]
			}>
		) => {
			state.roomChats.push(action.payload)
		},
		clearRoomChats: (state) => {
			state.roomChats = []
		},
	},
})

export const { setRooms, addRoomChat, clearRoomChats } = roomDataSlice.actions

export const getRooms = (state: RootState, roomId?: string) => {
	if (roomId) {
		return state.roomDate.rooms.find((room) => room.id === roomId)
	} else {
		return state.roomDate.rooms
	}
}

export const getRoomChat = (state: RootState, roomId: string) => {
	return state.roomDate.roomChats.find((roomChat) => roomChat.roomId === roomId)
}

export default roomDataSlice.reducer
