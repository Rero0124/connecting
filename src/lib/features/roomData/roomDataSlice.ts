import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '@/src/lib/store'
import { Room, RoomMessage } from '../../schemas/room.schema'
import { SerializeDatesForRedux } from '../../util'

interface RoomDataState {
	rooms: RoomState[]
	roomDetails: Record<
		string,
		RoomState & {
			message: RoomMesssageState[]
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
				}
			>
		) => {
			const key = action.payload.id
			state.roomDetails[key] = action.payload
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

export const { setRooms, setRoomDetail, removeRoomDetail, addRoomMessage } =
	roomDataSlice.actions

export const getRooms = (state: RootState, roomId?: string) => {
	if (roomId) {
		return state.roomDate.rooms.find((room) => room.id === roomId)
	} else {
		return state.roomDate.rooms
	}
}

export type RoomState = SerializeDatesForRedux<Room>
export type RoomMesssageState = SerializeDatesForRedux<RoomMessage>

export default roomDataSlice.reducer
