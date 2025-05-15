'use server'
import { deleteSession, verifySession } from './session'
import { ResponseDictionary } from '../types/dictionaries/res/dict'
import prisma from './prisma'
import bcryptjs from 'bcryptjs'
import { Profile } from './schemas/profile.schema'
import { ErrorResponse, SuccessResponse } from './schemas/api.schema'
import { SessionUserSuccessResponse } from './schemas/user.schema'
import { SessionProfileSuccessResponse } from './schemas/profile.schema'

export async function verifyUserIdInSession(userId: number): Promise<{
	response: SessionUserSuccessResponse | ErrorResponse
	status: number
}> {
	const sessionCheck = await verifySession()
	if (!sessionCheck.isAuth) {
		return {
			response: {
				status: 'error',
				code: ResponseDictionary.kr.RESPONSE_SESSION_CHECK_FAILED.code,
				message: ResponseDictionary.kr.RESPONSE_SESSION_CHECK_FAILED.message,
			},
			status: ResponseDictionary.kr.RESPONSE_SESSION_CHECK_FAILED.status,
		}
	}

	if (sessionCheck.userId !== userId) {
		return {
			response: {
				status: 'error',
				code: 0x0,
				message: '현재 로그인된 사용자와 일치하지 않습니다.',
			},
			status: 400,
		}
	}

	const user = await prisma.user.findUnique({
		where: {
			id: sessionCheck.userId,
		},
		select: {
			id: true,
			email: true,
		},
	})

	if (!user) {
		await deleteSession()

		return {
			response: {
				status: 'error',
				code: 0x0,
				message: '사용자가 존재하지 않습니다.',
			},
			status: 404,
		}
	}

	return {
		response: {
			status: 'success',
			code: 0x0,
			message: '사용자 검증이 완료되었습니다',
			data: {
				userId: user.id,
				email: user.email,
			},
		},
		status: 200,
	}
}

export async function verifyProfileIdInSession(
	userId: any,
	profileId: any
): Promise<{
	response: SessionProfileSuccessResponse | ErrorResponse
	status: number
}> {
	const profileIdNumber = Number(profileId)
	const sessionCheck = await verifySession()

	const data = await verifyUserIdInSession(userId)
	if (data.response.status === 'error') {
		return {
			response: data.response,
			status: data.status,
		}
	}

	if (!sessionCheck.isAuth) {
		return {
			response: {
				status: 'error',
				code: ResponseDictionary.kr.RESPONSE_SESSION_CHECK_FAILED.code,
				message: ResponseDictionary.kr.RESPONSE_SESSION_CHECK_FAILED.message,
			},
			status: ResponseDictionary.kr.RESPONSE_SESSION_CHECK_FAILED.status,
		}
	}

	if (isNaN(profileIdNumber)) {
		return {
			response: {
				status: 'error',
				code: 0x0,
				message: '프로필 아이디의 형식이 잘못되었습니다.',
			},
			status: 400,
		}
	}

	if (sessionCheck.profileId !== profileIdNumber) {
		return {
			response: {
				status: 'error',
				code: 0x0,
				message: '현재 로그인된 프로필과 일치하지 않습니다.',
			},
			status: 400,
		}
	}

	const profile = await prisma.profile.findFirst({
		where: {
			id: sessionCheck.profileId,
			userId: sessionCheck.userId,
		},
		select: {
			id: true,
			tag: true,
		},
	})

	if (!profile) {
		await deleteSession()

		return {
			response: {
				status: 'error',
				code: 0x0,
				message: '프로필이 존재하지 않습니다.',
			},
			status: 404,
		}
	}

	return {
		response: {
			status: 'success',
			code: 0x0,
			message: '사용자 검증이 완료되었습니다',
			data: {
				userId: sessionCheck.userId,
				profileId: profile.id,
				tag: profile.tag,
			},
		},
		status: 200,
	}
}

export const getAuthUserProfiles = async (
	email: string,
	password: string
): Promise<
	| {
			isAuth: false
	  }
	| {
			isAuth: true
			profiles: Profile[]
	  }
> => {
	const user = await prisma.user.findUnique({
		where: { email },
	})

	if (!user) {
		return {
			isAuth: false,
		}
	}

	if (!bcryptjs.compareSync(password, user.password)) {
		return {
			isAuth: false,
		}
	}

	const profiles = await prisma.profile.findMany({
		omit: {
			userId: true,
		},
		where: {
			user: {
				email,
			},
		},
	})

	return {
		isAuth: true,
		profiles,
	}
}
