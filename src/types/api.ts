export interface ApiResponse<T> {
	status: 'success' | 'error'
	code: number
	message: string
	data?: T
}

interface SuccessResponseWithoutData {
	status: 'success'
	code: number
	message: string
}
interface SuccessResponseWithData<T> {
	status: 'success'
	code: number
	message: string,
	data: T
}

export type SuccessResponse<T = void> = T extends void ? SuccessResponseWithoutData : SuccessResponseWithData<T>;

export interface ErrorResponse {
	status: 'error'
	code: number
	message: string
	errors?: Record<string, any>
}

export type ProfileList = {
	image: string
	name: string | null
	userId: number
	id: number
	statusType: string
	statusId: number
	tag: string
	information: string
	isCompany: boolean
	isOnline: boolean
	createdAt: Date
}[]

export type ProfileDetail = {
	tag: string
	statusType: string
	statusId: number
	name: string | null
	information: string
	image: string
	isCompany: boolean
	isOnline: boolean
	createdAt: Date
}

export type FilterProfileList = {
	id: number
	profileId: number
	filterProfileId: number
	filterType: string
	profile: {
		statusType: string
		statusId: number
		tag: string
		name: string | null
		image: string
		isOnline: boolean
		createdAt: Date
	}
}[]

export type FriendList = {
	name: string | null
	createdAt: Date
	statusType: string
	statusId: number
	tag: string
	image: string
	isOnline: boolean
}[]

export type FriendRequestList = {
	profile: {
		statusType: string
		statusId: number
		tag: string
		name: string | null
		image: string
		isOnline: boolean
		createdAt: Date
	}
	id: number
	sentAt: Date
}[]

export type DmSessionList = {
	name: string
	id: string
	iconType: string
	iconData: string
	createdAt: Date
}[]

export type DmSessionDetail = {
	message: {
		profile: {
			name: string | null
			tag: string
			image: string
		}
		id: number
		profileId: number
		dmSessionId: string
		contentType: string
		content: string
		isPinned: boolean
		sentAt: Date
		updatedAt: Date | null
	}[]
	id: string
	name: string
	iconType: string
	iconData: string
	createdAt: Date
}

export type DmSessionParticipantList = {
	id: number
	isNotAllowed: boolean
	joinedAt: Date
	profileId: number
	dmSessionId: string
}[]

export type RoomList = {
	id: string
	name: string
	masterProfileId: number
	iconType: string
	iconData: string
	createdAt: Date
}[]

export type RoomDetail = {
	message: {
		profile: {
			name: string | null
			tag: string
			image: string
		}
		roomId: string
		id: number
		profileId: number
		sentAt: Date
		content: string
		contentType: string
		isPinned: boolean
		updatedAt: Date | null
		isEdited: boolean
	}[]
	id: string
	name: string
	masterProfileId: number
	iconType: string
	iconData: string
	createdAt: Date
}

export type RoomParticipantList = {
	id: number
	joinedAt: Date
	profileId: number
	roomId: string
}[]

export type RoomJoinCodeList = {
	id: number
	code: string
	roomId: string
	authorProfileId: number
	expiresAt: Date
}[]

export type RoomJoinCodeDetail = {
	roomId: string
	id: number
	code: string
	authorProfileId: number
	expiresAt: Date
}