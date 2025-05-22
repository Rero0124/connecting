import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { VerifySession } from '../../schemas/session.schema'
import { SerializeData } from '../../util'

interface sessionFeatureState {
	session: VerifySessionState
}

const initialState: sessionFeatureState = {
	session: {
		isAuth: false,
	},
}

export const sessionSlice = createSlice({
	name: 'session',
	initialState,
	reducers: {
		setSession: (state, action: PayloadAction<VerifySessionState>) => {
			state.session = action.payload
		},
		deleteSession: (state) => {
			state.session = initialState.session
		},
	},
})

export const { setSession, deleteSession } = sessionSlice.actions

export type VerifySessionState = SerializeData<VerifySession>

export default sessionSlice.reducer
