import { createSlice, Middleware, PayloadAction } from '@reduxjs/toolkit'
import { getCookieValue } from '@/lib/util'
import { RootState } from '@/lib/store'

interface SaveDataState {
	initLoad: boolean
	selectedFriendMenu?: string
	selectedFriendSubMenu?: string
	selectedMessageMenu?: string
	title: string
	profile?: {
		id: number
		userTag: string
		userName?: string
		isCompany: boolean
		information?: string
		image: string
		createdAt: Date
	}
	navSize: number
}

const oldSaveData: {
	selectedFriendMenu?: string
	selectedFriendSubMenu?: string
	selectedMessageMenu?: string
	navSize?: number
} = JSON.parse(getCookieValue('savedata') ?? '{}')

const initialState: SaveDataState = {
	initLoad: false,
	title: '',
	navSize: oldSaveData.navSize ?? 200,
	selectedFriendMenu: oldSaveData.selectedFriendMenu,
	selectedFriendSubMenu: oldSaveData.selectedFriendSubMenu,
	selectedMessageMenu: oldSaveData.selectedMessageMenu,
}

const setCookieBySaveData = (state: SaveDataState) => {
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

export const saveDataSlice = createSlice({
	name: 'saveData',
	initialState,
	reducers: {
		setInitLoadEnd: (state) => {
			state.initLoad = true
		},
		setProfile: (
			state,
			action: PayloadAction<{
				id: number
				userTag: string
				userName?: string
				isCompany: boolean
				information?: string
				image: string
				createdAt: Date
			}>
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
} = saveDataSlice.actions

export const getInitLoadEnd = (state: RootState) => state.saveData.initLoad
export const getProfile = (state: RootState) => state.saveData.profile
export const getTitle = (state: RootState) => state.saveData.title
export const getNavSize = (state: RootState) => state.saveData.navSize
export const getSelectedFriendMenu = (state: RootState) =>
	state.saveData.selectedFriendMenu
export const getSelectedFriendSubMenu = (state: RootState) =>
	state.saveData.selectedFriendSubMenu
export const getSelectedMessageMenu = (state: RootState) =>
	state.saveData.selectedMessageMenu

export default saveDataSlice.reducer
