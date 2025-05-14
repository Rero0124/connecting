import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Friend, FriendRequest } from '../../schemas/friend.schema'
import { ProfileFilter } from '../../schemas/profile.schema'
import { SerializeDatesForRedux } from '../../util'

interface FriendFeatureState {
	friends: FriendState[]
	sentFriendRequests: FriendRequestState[]
	receivedFriendRequests: FriendRequestState[]
	filterFriends: ProfileFilterState[]
}

const initialState: FriendFeatureState = {
	friends: [],
	sentFriendRequests: [],
	receivedFriendRequests: [],
	filterFriends: [],
}

export const friendSlice = createSlice({
	name: 'friend',
	initialState,
	reducers: {
		setFriends: (state, action: PayloadAction<FriendState[]>) => {
			state.friends = action.payload
		},
		setSentFriendRequests: (
			state,
			action: PayloadAction<FriendRequestState[]>
		) => {
			state.sentFriendRequests = action.payload
		},
		setReceivedFriendRequests: (
			state,
			action: PayloadAction<FriendRequestState[]>
		) => {
			state.receivedFriendRequests = action.payload
		},
		setFilterFriends: (state, action: PayloadAction<ProfileFilterState[]>) => {
			state.filterFriends = action.payload
		},
	},
})

export const {
	setFriends,
	setSentFriendRequests,
	setReceivedFriendRequests,
	setFilterFriends,
} = friendSlice.actions

export const getFriends = (state: FriendFeatureState, tag?: string) => {
	if (tag) {
		return state.friends.find((friend) => friend.tag === tag)
	} else {
		return state.friends
	}
}

export const getFriendRequests = (
	state: FriendFeatureState,
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

export const getSentAddFriends = (state: FriendFeatureState, tag?: string) => {
	if (tag) {
		return state.sentFriendRequests.find(
			(sentFriendRequest) => sentFriendRequest.profile.tag === tag
		)
	} else {
		return state.sentFriendRequests
	}
}

export const getReceivedAddFriends = (
	state: FriendFeatureState,
	tag?: string
) => {
	if (tag) {
		return state.receivedFriendRequests.find(
			(receivedFriendRequest) => receivedFriendRequest.profile.tag === tag
		)
	} else {
		return state.receivedFriendRequests
	}
}

export const getFilterFriends = (state: FriendFeatureState, tag?: string) => {
	if (tag) {
		return state.filterFriends.find(
			(filterFriend) => filterFriend.profile.tag === tag
		)
	} else {
		return state.filterFriends
	}
}

export type FriendState = SerializeDatesForRedux<Friend>
export type FriendRequestState = SerializeDatesForRedux<FriendRequest>
export type ProfileFilterState = SerializeDatesForRedux<ProfileFilter>

export default friendSlice.reducer
