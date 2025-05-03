import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '@/src/lib/store'
import { DmSessionDetail, DmSessionList } from '@/src/types/api'

interface DmSessionDataState {
	allowedDmSessions: DmSessionList
	notAllowedDmSessions: DmSessionList
	dmDetails: Record<string, DmSessionDetail>
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
		setAllowedDmSession: (state, action: PayloadAction<DmSessionList>) => {
			state.allowedDmSessions = action.payload
		},
		setNotAllowedDmSession: (state, action: PayloadAction<DmSessionList>) => {
			state.notAllowedDmSessions = action.payload
		},
		addDmDetail: (state, action: PayloadAction<DmSessionDetail>) => {
			const key = action.payload.id
			state.dmDetails[key] = action.payload
		},
		removeDmDetail: (state, action: PayloadAction<string>) => {
			delete state.dmDetails[action.payload]
		},
	},
})

export const {
	setAllowedDmSession,
	setNotAllowedDmSession,
	addDmDetail,
	removeDmDetail,
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

export default dmDataSlice.reducer
