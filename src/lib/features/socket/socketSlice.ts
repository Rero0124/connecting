import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { VerifySession } from '../../schemas/session.schema'

interface SocketState {
	transport: string
}

const initialState: SocketState = {
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
