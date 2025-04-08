import { configureStore } from '@reduxjs/toolkit'
import savedataReducer, { setCookieBySaveData } from './features/savedata/savedataSlice'

export const makeStore = () => {
  return configureStore({
    reducer: {
      savedata: savedataReducer
    },
    middleware: getDefaultMiddleware => 
      getDefaultMiddleware()
      .concat(setCookieBySaveData)
  })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']