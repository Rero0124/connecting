import { UIDictionaryType } from './dict'

const UIDictionary: UIDictionaryType = {
	UI_USER_CREATED: { message: 'User created successfully.' },
	UI_USER_UPDATED: { message: 'User profile updated.' },
	UI_ROOM_CREATED: { message: 'Chat room has been created.' },
	UI_MESSAGE_SENT: { message: 'Message sent.' },
	UI_FORM_SUBMIT_SUCCESS: { message: 'Form submitted successfully.' },
	UI_FORM_SUBMIT_FAILED: {
		message: 'Form submission failed. Please try again.',
	},
	UI_HOME_TITLE: { message: 'Welcome to the Chat App' },
	UI_LOGIN_BUTTON: { message: 'Log In' },
	UI_LOGOUT_BUTTON: { message: 'Log Out' },
	UI_PROFILE_TITLE: { message: 'Your Profile' },
}

export default UIDictionary
