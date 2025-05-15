import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SerializeDatesForRedux } from '@/src/lib/util'
import { RootState } from '@/src/lib/store'
import { Profile } from '../../schemas/profile.schema'
import { getCookieValue } from '../../clientUtil'

interface ViewContextFeatureState {
	initLoad: boolean
	selectedFriendMenu?: string
	selectedFriendSubMenu?: string
	selectedMessageMenu?: string
	title: string
	profile?: ProfileState
	navSize: number
}

const oldSaveData: {
	selectedFriendMenu?: string
	selectedFriendSubMenu?: string
	selectedMessageMenu?: string
	navSize?: number
} = JSON.parse(getCookieValue('savedata') ?? '{}')

const initialState: ViewContextFeatureState = {
	initLoad: false,
	title: '',
	navSize: oldSaveData.navSize ?? 200,
	selectedFriendMenu: oldSaveData.selectedFriendMenu,
	selectedFriendSubMenu: oldSaveData.selectedFriendSubMenu,
	selectedMessageMenu: oldSaveData.selectedMessageMenu,
}

const setCookieBySaveData = (state: ViewContextFeatureState) => {
	const {
		selectedFriendMenu,
		selectedFriendSubMenu,
		selectedMessageMenu,
		navSize,
	} = state
	document.cookie =
		'savedata=' +
		JSON.stringify({
			selectedFriendMenu,
			selectedFriendSubMenu,
			selectedMessageMenu,
			navSize,
		})
}

export const viewContextSlice = createSlice({
	name: 'viewContext',
	initialState,
	reducers: {
		setInitLoadEnd: (state) => {
			state.initLoad = true
		},
		setProfile: (
			state,
			action: PayloadAction<SerializeDatesForRedux<Profile>>
		) => {
			state.profile = action.payload
		},
		setTitle: (state, action: PayloadAction<string>) => {
			state.title = action.payload
			setCookieBySaveData(state)
		},
		setNavSize: (state, action: PayloadAction<number>) => {
			state.navSize = action.payload
			setCookieBySaveData(state)
		},
		setSelectedFriendMenu: (state, action: PayloadAction<string>) => {
			state.selectedFriendMenu = action.payload
			setCookieBySaveData(state)
		},
		setSelectedFriendSubMenu: (state, action: PayloadAction<string>) => {
			state.selectedFriendSubMenu = action.payload
			setCookieBySaveData(state)
		},
		setSelectedMessageMenu: (state, action: PayloadAction<string>) => {
			state.selectedMessageMenu = action.payload
			setCookieBySaveData(state)
		},
	},
})

export const {
	setInitLoadEnd,
	setProfile,
	setTitle,
	setNavSize,
	setSelectedFriendMenu,
	setSelectedFriendSubMenu,
	setSelectedMessageMenu,
} = viewContextSlice.actions

export const getInitLoadEnd = (state: RootState) => state.viewContext.initLoad
export const getProfile = (state: RootState) => state.viewContext.profile
export const getTitle = (state: RootState) => state.viewContext.title
export const getNavSize = (state: RootState) => state.viewContext.navSize
export const getSelectedFriendMenu = (state: RootState) =>
	state.viewContext.selectedFriendMenu
export const getSelectedFriendSubMenu = (state: RootState) =>
	state.viewContext.selectedFriendSubMenu
export const getSelectedMessageMenu = (state: RootState) =>
	state.viewContext.selectedMessageMenu

export type ProfileState = SerializeDatesForRedux<Profile>

export default viewContextSlice.reducer
