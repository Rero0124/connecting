import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Room, RoomMessage } from '../../schemas/room.schema'
import { SerializeDatesForRedux } from '../../util'
import { ChannelType, RoomChannel } from '@prisma/client'

interface RoomFeatureState {
	rooms: RoomState[]
	roomDetails: Record<
		string,
		RoomState & {
			channel: Record<
				number,
				RoomChannelState & {
					message: RoomMesssageState[]
				}
			>
		}
	>
}

const initialState: RoomFeatureState = {
	rooms: [],
	roomDetails: {},
}

export const roomSlice = createSlice({
	name: 'room',
	initialState,
	reducers: {
		setRooms: (state, action: PayloadAction<RoomState[]>) => {
			state.rooms = action.payload
		},
		setRoomDetail: (
			state,
			action: PayloadAction<
				RoomState & {
					channel: (RoomChannelState & {
						message: RoomMesssageState[]
					})[]
				}
			>
		) => {
			const key = action.payload.id
			const { channel, ...roomDetail } = action.payload
			state.roomDetails[key] = {
				...roomDetail,
				channel: channel.reduce<
					Record<
						number,
						RoomChannelState & {
							message: RoomMesssageState[]
						}
					>
				>((acc, channel) => {
					acc[channel.id] = channel
					return acc
				}, {}),
			}
		},
		removeRoomDetail: (state, action: PayloadAction<string>) => {
			delete state.roomDetails[action.payload]
		},
		updateRoomChannels: (state, action: PayloadAction<RoomChannelState[]>) => {
			action.payload.forEach((channel) => {
				const roomId = channel.roomId
				if (state.roomDetails[roomId]) {
					state.roomDetails[roomId].channel[channel.id] = {
						...state.roomDetails[roomId].channel[channel.id],
						...channel,
					}
				}
			})
		},
		addRoomMessage: (state, action: PayloadAction<RoomMesssageState>) => {
			state.roomDetails[action.payload.roomId].channel[
				action.payload.roomChannelId
			].message.push(action.payload)
		},
	},
})

export const {
	setRooms,
	setRoomDetail,
	removeRoomDetail,
	updateRoomChannels,
	addRoomMessage,
} = roomSlice.actions

export const getRooms = (state: RoomFeatureState, roomId?: string) => {
	if (roomId) {
		return state.rooms.find((room) => room.id === roomId)
	} else {
		return state.rooms
	}
}

export const getRoomTextChannel = (
	state: RoomFeatureState,
	roomId: string,
	channelId?: number
) => {
	const room = state.roomDetails[roomId]
	if (!room || !room.channel || Object.keys(room.channel).length === 0)
		return undefined

	if (channelId) {
		const findedChannel = Object.values(room.channel).find(
			(channel) => channel.id === channelId && channel.type === ChannelType.text
		)
		if (findedChannel) {
			return findedChannel
		}
	}
	return Object.values(room.channel).find(
		(channel) => channel.type === ChannelType.text
	)
}

export type RoomState = SerializeDatesForRedux<Room>
export type RoomMesssageState = SerializeDatesForRedux<RoomMessage>
export type RoomChannelState = SerializeDatesForRedux<RoomChannel>

export default roomSlice.reducer
