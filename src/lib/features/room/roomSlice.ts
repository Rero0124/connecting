import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Room, RoomChannel, RoomMessage } from '../../schemas/room.schema'
import { SerializeData } from '../../util'

interface RoomFeatureState {
	rooms: RoomState[]
	roomDetails: (RoomState & {
		channel: (RoomChannelState & {
			message: RoomMessageState[]
		})[]
	})[]
	roomDetailIdx: Record<
		string,
		{
			idx: number
			channel: Record<
				string,
				{
					idx: number
					message: Record<string, number>
				}
			>
		}
	>
}

const initialState: RoomFeatureState = {
	rooms: [],
	roomDetails: [],
	roomDetailIdx: {},
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
						message: RoomMessageState[]
					})[]
				}
			>
		) => {
			const roomId = action.payload.id
			const roomIdx = state.roomDetailIdx[roomId]?.idx
			const { channel, ...roomDetail } = action.payload
			if (roomIdx !== undefined) {
				state.roomDetails[roomIdx] = {
					...roomDetail,
					channel: [],
				}
				state.roomDetailIdx[roomId].channel = {}
				channel.forEach((chnl) => {
					const { message, ...channelDetail } = chnl
					const channelId = chnl.id
					const channelIdx = state.roomDetails[roomIdx].channel.length
					state.roomDetails[roomIdx].channel.push({
						...channelDetail,
						message: [],
					})
					state.roomDetailIdx[roomId].channel[channelId] = {
						idx: channelIdx,
						message: {},
					}
					message.forEach((msg) => {
						const messageId = msg.id
						state.roomDetailIdx[roomId].channel[channelId].message[messageId] =
							state.roomDetails[roomIdx].channel[channelIdx].message.length
						state.roomDetails[roomIdx].channel[channelIdx].message.push(msg)
					})
				})
			} else {
				const newRoomIdx = state.roomDetails.length
				state.roomDetails.push({
					...roomDetail,
					channel: [],
				})
				state.roomDetailIdx[roomId] = {
					idx: newRoomIdx,
					channel: {},
				}
				channel.forEach((chnl) => {
					const { message, ...channelDetail } = chnl
					const channelId = chnl.id
					const channelIdx = state.roomDetails[newRoomIdx].channel.length
					state.roomDetails[newRoomIdx].channel.push({
						...channelDetail,
						message: [],
					})
					state.roomDetailIdx[roomId].channel[channelId] = {
						idx: channelIdx,
						message: {},
					}
					message.forEach((msg) => {
						const messageId = msg.id
						state.roomDetailIdx[roomId].channel[channelId].message[messageId] =
							state.roomDetails[newRoomIdx].channel[channelIdx].message.length
						state.roomDetails[newRoomIdx].channel[channelIdx].message.push(msg)
					})
				})
			}
		},
		removeRoomDetail: (state, action: PayloadAction<string>) => {
			delete state.roomDetailIdx[action.payload]
		},
		updateRoomChannels: (state, action: PayloadAction<RoomChannelState[]>) => {
			action.payload.forEach((channel) => {
				const roomIdx = state.roomDetailIdx[channel.roomId]?.idx
				if (roomIdx !== undefined) {
					let channelIdx =
						state.roomDetailIdx[channel.roomId].channel[channel.id]?.idx
					if (channelIdx !== undefined) {
						const oldChannel = state.roomDetails[roomIdx].channel[channelIdx]
						state.roomDetails[roomIdx].channel[channelIdx] = {
							...channel,
							...oldChannel,
						}
					} else {
						channelIdx = state.roomDetails[roomIdx].channel.length
						state.roomDetails[roomIdx].channel.push({
							...channel,
							message: [],
						})
						state.roomDetailIdx[roomIdx].channel[channel.id] = {
							idx: channelIdx,
							message: {},
						}
					}
				}
			})
		},
		addRoomMessage: (state, action: PayloadAction<RoomMessageState>) => {
			const roomIdx = state.roomDetailIdx[action.payload.roomId]?.idx
			const channelIdx =
				state.roomDetailIdx[action.payload.roomId]?.channel[
					action.payload.roomChannelId
				]?.idx
			if (roomIdx !== undefined && channelIdx !== undefined) {
				state.roomDetailIdx[action.payload.roomId].channel[
					action.payload.roomChannelId
				].message[action.payload.id] =
					state.roomDetails[roomIdx].channel[channelIdx].message.length
				state.roomDetails[roomIdx].channel[channelIdx].message.push(
					action.payload
				)
			}
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
	channelId?: bigint
) => {
	const roomIdx = state.roomDetailIdx[roomId]?.idx
	if (roomIdx === undefined || !state.roomDetails[roomIdx].channel.length)
		return undefined

	if (channelId) {
		const channelIdx =
			state.roomDetailIdx[roomId].channel[channelId.toString()]?.idx
		if (channelIdx === undefined) return undefined
		return state.roomDetails[roomIdx].channel[channelIdx]
	}

	return state.roomDetails[roomIdx].channel.find(
		(c) => state.roomDetailIdx[roomId].channel[c.id]
	)
}

export type RoomState = SerializeData<Room>
export type RoomMessageState = SerializeData<RoomMessage>
export type RoomChannelState = SerializeData<RoomChannel>

export default roomSlice.reducer
