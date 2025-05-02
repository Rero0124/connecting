import { RootState } from '@/src/lib/store'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface FriendType {
	image: string
	tag: string
	statusType: string
	statusId: number
	name: string | null
	isOnline: boolean
	createdAt: Date
}

export interface FriendRequestType {
	profile: FriendType
	id: number
	sentAt: Date
}

export interface FilterUserType extends FriendType {
	filterType: string
}

interface FriendDataState {
	friends: FriendType[]
	sentFriendRequests: FriendRequestType[]
	receivedFriendRequests: FriendRequestType[]
	filterFriends: FilterUserType[]
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
		setFriends: (state, action: PayloadAction<FriendType[]>) => {
			state.friends = action.payload
		},
		setSentFriendRequests: (
			state,
			action: PayloadAction<FriendRequestType[]>
		) => {
			state.sentFriendRequests = action.payload
		},
		setReceivedFriendRequests: (
			state,
			action: PayloadAction<FriendRequestType[]>
		) => {
			state.receivedFriendRequests = action.payload
		},
		setFilterFriends: (state, action: PayloadAction<FilterUserType[]>) => {
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
			(filterFriend) => filterFriend.tag === tag
		)
	} else {
		return state.friendsData.filterFriends
	}
}

export default friendDataSlice.reducer
