import { Language } from '../i18n'
import EN_UIDictionary from './en'
import KR_UIDictionary from './kr'

export interface UITextInfo {
	message: string
}

export type UIKey =
	| 'UI_USER_CREATED'
	| 'UI_USER_UPDATED'
	| 'UI_ROOM_CREATED'
	| 'UI_MESSAGE_SENT'
	| 'UI_FORM_SUBMIT_SUCCESS'
	| 'UI_FORM_SUBMIT_FAILED'
	| 'UI_HOME_TITLE'
	| 'UI_LOGIN_BUTTON'
	| 'UI_LOGOUT_BUTTON'
	| 'UI_PROFILE_TITLE'

export type UIDictionaryType = Record<UIKey, UITextInfo>

export const UIDictionary: Record<Language, UIDictionaryType> = {
	en: EN_UIDictionary,
	kr: KR_UIDictionary,
}
