import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface SocketFeatureState {
	transport: string
}

const initialState: SocketFeatureState = {
	transport: 'N/A',
}

export const socketSlice = createSlice({
	name: 'session',
	initialState,
	reducers: {
		setTransport: (state, action: PayloadAction<string>) => {
			state.transport = action.payload
		},
	},
})

export const { setTransport } = socketSlice.actions

export default socketSlice.reducer
