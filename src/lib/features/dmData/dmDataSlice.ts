import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '@/src/lib/store'

export interface DmSessionType {
	name: string
	id: string
	createdAt: Date
	iconType: string
	iconData: string
}

export interface DmMessageType {
	id: number
	sentUserTag: string
	sentUserName?: string
	sentUserImage: string
	contentType: string
	content: string
	isPinned: boolean
	sentAt: Date
}

interface DmSessionDataState {
	allowedDmSessions: DmSessionType[]
	notAllowedDmSessions: DmSessionType[]
	dmMessages: {
		messageId: string
		chats: DmMessageType[]
	}[]
}

const initialState: DmSessionDataState = {
	allowedDmSessions: [],
	notAllowedDmSessions: [],
	dmMessages: [],
}

export const dmDataSlice = createSlice({
	name: 'dmData',
	initialState,
	reducers: {
		setAllowedDmSession: (state, action: PayloadAction<DmSessionType[]>) => {
			state.allowedDmSessions = action.payload
		},
		setNotAllowedDmSession: (state, action: PayloadAction<DmSessionType[]>) => {
			state.notAllowedDmSessions = action.payload
		},
		addDmMessage: (
			state,
			action: PayloadAction<{
				messageId: string
				chats: DmMessageType[]
			}>
		) => {
			state.dmMessages.push(action.payload)
		},
		clearDmMessage: (state) => {
			state.dmMessages = []
		},
	},
})

export const {
	setAllowedDmSession,
	setNotAllowedDmSession,
	addDmMessage,
	clearDmMessage,
} = dmDataSlice.actions

export const getAllowedDmSession = (state: RootState, dmSessionId?: string) => {
	if (dmSessionId) {
		return state.dmData.allowedDmSessions.find(
			(allowedDmSession) => allowedDmSession.id === dmSessionId
		)
	} else {
		return state.dmData.allowedDmSessions
	}
}

export const getNotAllowedDmSession = (
	state: RootState,
	messageId?: string
) => {
	if (messageId) {
		return state.dmData.notAllowedDmSessions.find(
			(notAllowedMessage) => notAllowedMessage.id === messageId
		)
	} else {
		return state.dmData.notAllowedDmSessions
	}
}

export const getDmMessage = (state: RootState, messageId: string) => {
	return state.dmData.dmMessages.find(
		(dmMessage) => dmMessage.messageId === messageId
	)
}

export default dmDataSlice.reducer
