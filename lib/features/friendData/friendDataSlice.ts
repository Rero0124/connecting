import { RootState } from '@/lib/store';
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface FriendType {
  userTag: string;
  userName?: string;
  image: string;
  createdAt: Date;
}

export interface FilterUserType extends FriendType {
  filterType: string
}

interface FriendDataState {
  friends: FriendType[];
  sendAddFriends: FriendType[];
  reciveAddFriends: FriendType[];
  filterFriends: FilterUserType[];
}

const initialState: FriendDataState = {
  friends: [],
  sendAddFriends: [],
  reciveAddFriends: [],
  filterFriends: []
}

export const friendDataSlice = createSlice({
  name: 'savedata',
  initialState,
  reducers: {
    setFriends: (state, action: PayloadAction<FriendType[]>) => {
      state.friends = action.payload;
    },
    setSendAddFriends: (state, action: PayloadAction<FriendType[]>) => {
      state.sendAddFriends = action.payload;
    },
    setReciveAddFriends: (state, action: PayloadAction<FriendType[]>) => {
      state.reciveAddFriends = action.payload;
    },
    setFilterFriends: (state, action: PayloadAction<FilterUserType[]>) => {
      state.filterFriends = action.payload;
    }
  }
})

export const { setFriends, setSendAddFriends, setReciveAddFriends, setFilterFriends } = friendDataSlice.actions

export const getFriends = (state: RootState, userTag?: string) => {
  if(userTag) {
    return state.friendsData.friends.find(friend => friend.userTag === userTag);
  } else {
    return state.friendsData.friends
  }
}

export const getSendAddFriends = (state: RootState, userTag?: string) => {
  if(userTag) {
    return state.friendsData.sendAddFriends.find(sendAddFriend => sendAddFriend.userTag === userTag);
  } else {
    return state.friendsData.sendAddFriends
  }
}

export const getReciveAddFriends = (state: RootState, userTag?: string) => {
  if(userTag) {
    return state.friendsData.reciveAddFriends.find(reciveAddFriend => reciveAddFriend.userTag === userTag);
  } else {
    return state.friendsData.reciveAddFriends
  }
}

export const getFilterFriends = (state: RootState, userTag?: string) => {
  if(userTag) {
    return state.friendsData.filterFriends.find(filterFriend => filterFriend.userTag === userTag);
  } else {
    return state.friendsData.filterFriends
  }
}

export default friendDataSlice.reducer