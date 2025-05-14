import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { VerifySession } from '../../schemas/session.schema'

interface sessionFeatureState {
	session: VerifySession
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
		setSession: (state, action: PayloadAction<VerifySession>) => {
			state.session = action.payload
		},
		deleteSession: (state) => {
			state.session = initialState.session
		},
	},
})

export const { setSession, deleteSession } = sessionSlice.actions

export default sessionSlice.reducer
