import { UIDictionaryType } from './dict'

const UIDictionary: UIDictionaryType = {
	UI_USER_CREATED: { message: '사용자가 성공적으로 생성되었습니다.' },
	UI_USER_UPDATED: { message: '프로필이 수정되었습니다.' },
	UI_ROOM_CREATED: { message: '채팅방이 생성되었습니다.' },
	UI_MESSAGE_SENT: { message: '메시지가 전송되었습니다.' },
	UI_FORM_SUBMIT_SUCCESS: { message: '폼이 성공적으로 제출되었습니다.' },
	UI_FORM_SUBMIT_FAILED: {
		message: '폼 제출에 실패했습니다. 다시 시도해주세요.',
	},
	UI_HOME_TITLE: { message: '채팅 앱에 오신 것을 환영합니다' },
	UI_LOGIN_BUTTON: { message: '로그인' },
	UI_LOGOUT_BUTTON: { message: '로그아웃' },
	UI_PROFILE_TITLE: { message: '내 프로필' },
}

export default UIDictionary;