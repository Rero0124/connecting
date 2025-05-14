import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '@/src/lib/store'
import { Room, RoomMessage } from '../../schemas/room.schema'
import { SerializeDatesForRedux } from '../../util'
import { RoomChannel } from '@prisma/client'

interface RoomDataState {
	rooms: RoomState[]
	roomDetails: Record<
		string,
		RoomState & {
			message: RoomMesssageState[]
		} & {
			channel: RoomChannelState[]
		}
	>
}

const initialState: RoomDataState = {
	rooms: [],
	roomDetails: {},
}

export const roomDataSlice = createSlice({
	name: 'roomData',
	initialState,
	reducers: {
		setRooms: (state, action: PayloadAction<RoomState[]>) => {
			state.rooms = action.payload
		},
		setRoomDetail: (
			state,
			action: PayloadAction<
				RoomState & {
					message: RoomMesssageState[]
				} & {
					channel: RoomChannelState[]
				}
			>
		) => {
			const key = action.payload.id
			state.roomDetails[key] = action.payload
		},
		setRoomChannels: (state, action: PayloadAction<RoomChannelState[]>) => {
			const key = action.payload[0].roomId
			if (state.roomDetails[key]) {
				state.roomDetails[key].channel = action.payload
			}
		},
		removeRoomDetail: (state, action: PayloadAction<string>) => {
			delete state.roomDetails[action.payload]
		},
		addRoomMessage: (state, action: PayloadAction<RoomMesssageState>) => {
			const key = action.payload.roomId
			state.roomDetails[key].message.push(action.payload)
		},
	},
})

export const {
	setRooms,
	setRoomDetail,
	setRoomChannels,
	removeRoomDetail,
	addRoomMessage,
} = roomDataSlice.actions

export const getRooms = (state: RootState, roomId?: string) => {
	if (roomId) {
		return state.roomDate.rooms.find((room) => room.id === roomId)
	} else {
		return state.roomDate.rooms
	}
}

export type RoomState = SerializeDatesForRedux<Room>
export type RoomMesssageState = SerializeDatesForRedux<RoomMessage>
export type RoomChannelState = SerializeDatesForRedux<RoomChannel>

export default roomDataSlice.reducer
