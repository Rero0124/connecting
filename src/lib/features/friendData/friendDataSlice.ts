import { RootState } from '@/src/lib/store'
import {
	ProfileFilterList,
	FriendList,
	FriendRequestList,
} from '@/src/types/api'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface FriendDataState {
	friends: FriendList
	sentFriendRequests: FriendRequestList
	receivedFriendRequests: FriendRequestList
	filterFriends: ProfileFilterList
}

const initialState: FriendDataState = {
	friends: [],
	sentFriendRequests: [],
	receivedFriendRequests: [],
	filterFriends: [],
}

export const friendDataSlice = createSlice({
	name: 'savedata',
	initialState,
	reducers: {
		setFriends: (state, action: PayloadAction<FriendList>) => {
			state.friends = action.payload
		},
		setSentFriendRequests: (
			state,
			action: PayloadAction<FriendRequestList>
		) => {
			state.sentFriendRequests = action.payload
		},
		setReceivedFriendRequests: (
			state,
			action: PayloadAction<FriendRequestList>
		) => {
			state.receivedFriendRequests = action.payload
		},
		setFilterFriends: (state, action: PayloadAction<ProfileFilterList>) => {
			state.filterFriends = action.payload
		},
	},
})

export const {
	setFriends,
	setSentFriendRequests,
	setReceivedFriendRequests,
	setFilterFriends,
} = friendDataSlice.actions

export const getFriends = (state: RootState, tag?: string) => {
	if (tag) {
		return state.friendsData.friends.find((friend) => friend.tag === tag)
	} else {
		return state.friendsData.friends
	}
}

export const getSentAddFriends = (state: RootState, tag?: string) => {
	if (tag) {
		return state.friendsData.sentFriendRequests.find(
			(sentFriendRequest) => sentFriendRequest.profile.tag === tag
		)
	} else {
		return state.friendsData.sentFriendRequests
	}
}

export const getReceivedAddFriends = (state: RootState, tag?: string) => {
	if (tag) {
		return state.friendsData.receivedFriendRequests.find(
			(receivedFriendRequest) => receivedFriendRequest.profile.tag === tag
		)
	} else {
		return state.friendsData.receivedFriendRequests
	}
}

export const getFilterFriends = (state: RootState, tag?: string) => {
	if (tag) {
		return state.friendsData.filterFriends.find(
			(filterFriend) => filterFriend.profile.tag === tag
		)
	} else {
		return state.friendsData.filterFriends
	}
}

export default friendDataSlice.reducer
