import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { DmMessage, DmSession } from '../../schemas/dm.schema'
import { SerializeDatesForRedux } from '../../util'

interface DmSessionDataState {
	allowedDmSessions: DmSessionState[]
	notAllowedDmSessions: DmSessionState[]
	dmDetails: Record<
		string,
		DmSessionState & {
			message: DmMessageState[]
		}
	>
}

const initialState: DmSessionDataState = {
	allowedDmSessions: [],
	notAllowedDmSessions: [],
	dmDetails: {},
}

export const dmDataSlice = createSlice({
	name: 'dmData',
	initialState,
	reducers: {
		setAllowedDmSession: (state, action: PayloadAction<DmSessionState[]>) => {
			state.allowedDmSessions = action.payload
		},
		setNotAllowedDmSession: (
			state,
			action: PayloadAction<DmSessionState[]>
		) => {
			state.notAllowedDmSessions = action.payload
		},
		setDmDetail: (
			state,
			action: PayloadAction<
				DmSessionState & {
					message: DmMessageState[]
				}
			>
		) => {
			const key = action.payload.id
			state.dmDetails[key] = action.payload
		},
		removeDmDetail: (state, action: PayloadAction<string>) => {
			delete state.dmDetails[action.payload]
		},
		addDmMessage: (state, action: PayloadAction<DmMessageState>) => {
			const key = action.payload.dmSessionId
			state.dmDetails[key].message.push(action.payload)
		},
	},
})

export const {
	setAllowedDmSession,
	setNotAllowedDmSession,
	setDmDetail,
	removeDmDetail,
	addDmMessage,
} = dmDataSlice.actions

export const getAllowedDmSession = (
	state: DmSessionDataState,
	dmSessionId?: string
) => {
	if (dmSessionId) {
		return state.allowedDmSessions.find(
			(allowedDmSession) => allowedDmSession.id === dmSessionId
		)
	} else {
		return state.allowedDmSessions
	}
}

export const getNotAllowedDmSession = (
	state: DmSessionDataState,
	dmSessionId?: string
) => {
	if (dmSessionId) {
		return state.notAllowedDmSessions.find(
			(notAllowedDmSession) => notAllowedDmSession.id === dmSessionId
		)
	} else {
		return state.notAllowedDmSessions
	}
}

export type DmSessionState = SerializeDatesForRedux<DmSession>
export type DmMessageState = SerializeDatesForRedux<DmMessage>

export default dmDataSlice.reducer
