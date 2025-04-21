import {configureStore} from "@reduxjs/toolkit";
import saveDataReducer from "./features/saveData/saveDataSlice";
import friendDataReducer from "./features/friendData/friendDataSlice";
import messageDataReducer from "./features/messageData/messageDataSlice";
import roomDataReducer from "./features/roomData/roomDataSlice";

export const makeStore = () => {
    return configureStore({
        reducer: {
            saveData: saveDataReducer,
            friendsData: friendDataReducer,
            messageData: messageDataReducer,
            roomDate: roomDataReducer,
        },
    });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
