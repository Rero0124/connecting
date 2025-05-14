import { configureStore } from '@reduxjs/toolkit'
import saveDataReducer from './features/saveData/saveDataSlice'
import friendDataReducer from './features/friendData/friendDataSlice'
import dmDataReducer from './features/dmData/dmDataSlice'
import roomDataReducer from './features/roomData/roomDataSlice'
import sessionReducer from './features/session/sessionSlice'
import socketReducer from './features/socket/socketSlice'

export const makeStore = () => {
	return configureStore({
		reducer: {
			saveData: saveDataReducer,
			friendsData: friendDataReducer,
			dmData: dmDataReducer,
			roomDate: roomDataReducer,
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
