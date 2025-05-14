import { configureStore } from '@reduxjs/toolkit'
import saveDataReducer from './features/viewContext/viewContextSlice'
import friendDataReducer from './features/friend/friendSlice'
import dmDataReducer from './features/dm/dmSlice'
import roomDataReducer from './features/room/roomSlice'
import sessionReducer from './features/session/sessionSlice'
import socketReducer from './features/socket/socketSlice'

export const makeStore = () => {
	return configureStore({
		reducer: {
			viewContext: saveDataReducer,
			friend: friendDataReducer,
			dm: dmDataReducer,
			room: roomDataReducer,
			session: sessionReducer,
			socket: socketReducer,
		},
	})
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
