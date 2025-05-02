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

export const getFriends = (state: FriendDataState, tag?: string) => {
	if (tag) {
		return state.friends.find((friend) => friend.tag === tag)
	} else {
		return state.friends
	}
}

export const getFriendRequests = (
	state: FriendDataState,
	requestId?: number
) => {
	if (requestId) {
		return [...state.sentFriendRequests, ...state.receivedFriendRequests].find(
			(sentFriendRequest) => sentFriendRequest.id === requestId
		)
	} else {
		return state.sentFriendRequests
	}
}

export const getSentAddFriends = (state: FriendDataState, tag?: string) => {
	if (tag) {
		return state.sentFriendRequests.find(
			(sentFriendRequest) => sentFriendRequest.profile.tag === tag
		)
	} else {
		return state.sentFriendRequests
	}
}

export const getReceivedAddFriends = (state: FriendDataState, tag?: string) => {
	if (tag) {
		return state.receivedFriendRequests.find(
			(receivedFriendRequest) => receivedFriendRequest.profile.tag === tag
		)
	} else {
		return state.receivedFriendRequests
	}
}

export const getFilterFriends = (state: FriendDataState, tag?: string) => {
	if (tag) {
		return state.filterFriends.find(
			(filterFriend) => filterFriend.profile.tag === tag
		)
	} else {
		return state.filterFriends
	}
}

export default friendDataSlice.reducer
