'use server'

import { JoinFormState, LoginFormState } from '@/src/lib/form/auth'
import prisma from '@/src/lib/prisma'
import {
	AuthGetProfilesInputSchema,
	AuthJoinBodySchema,
	AuthJoinInputSchema,
	AuthLoginInputSchema,
} from '@/src/lib/schemas/auth.schema'
import { getAuthUserProfiles } from '@/src/lib/serverUtil'
import { createSession } from '@/src/lib/session'
import { fetchWithValidation } from '@/src/lib/util'

export async function login(
	state: LoginFormState,
	formData: FormData
): Promise<LoginFormState> {
	const getProfilesFields = AuthGetProfilesInputSchema.safeParse({
		email: formData.get('email'),
		password: formData.get('password'),
	})

	const loginFields = AuthLoginInputSchema.safeParse({
		profileId: formData.get('profileId'),
		email: formData.get('email'),
		password: formData.get('password'),
	})

	if (!getProfilesFields.success) {
		return {
			data: {
				email: formData.get('email')?.toString(),
				password: formData.get('password')?.toString(),
			},
			errors: getProfilesFields.error.flatten().fieldErrors,
		}
	}

	if (loginFields.success && loginFields.data.profileId > 0) {
		const { email, password, profileId } = loginFields.data

		const profiles = await getAuthUserProfiles(email, password)

		if (!profiles.isAuth) {
			return {
				data: {
					email: formData.get('email')?.toString(),
					password: formData.get('password')?.toString(),
				},
				message: '이메일 또는 비밀번호가 일치하지 않습니다.',
			}
		}

		const profile = await prisma.profile.findFirst({
			where: {
				id: profileId,
			},
			select: {
				id: true,
				userId: true,
			},
		})

		if (!profile) {
			return {
				data: {
					email: formData.get('email')?.toString(),
					password: formData.get('password')?.toString(),
				},
				message: '프로필이 존재하지 않습니다.',
			}
		}

		await createSession(profile.userId, profile.id)

		return {
			data: {
				email: formData.get('email')?.toString(),
				password: formData.get('password')?.toString(),
			},
			message: '로그인 되었습니다.',
			isLogin: true,
		}
	} else {
		const { email, password } = getProfilesFields.data

		const profiles = await getAuthUserProfiles(email, password)

		if (!profiles.isAuth) {
			return {
				data: {
					email: formData.get('email')?.toString(),
					password: formData.get('password')?.toString(),
				},
				message: '이메일 또는 비밀번호가 일치하지 않습니다.',
			}
		}

		return {
			data: {
				email: formData.get('email')?.toString(),
				password: formData.get('password')?.toString(),
			},
			profiles: profiles.profiles,
		}
	}
}

export async function join(
	state: JoinFormState,
	formData: FormData
): Promise<JoinFormState> {
	const joinFields = AuthJoinInputSchema.safeParse({
		tag: formData.get('tag'),
		name: formData.get('name'),
		email: formData.get('email'),
		password: formData.get('password'),
	})

	if (!joinFields.success) {
		return {
			data: {
				tag: formData.get('tag')?.toString(),
				name: formData.get('name')?.toString(),
				email: formData.get('email')?.toString(),
				password: formData.get('password')?.toString(),
			},
			errors: joinFields.error.flatten().fieldErrors,
		}
	}

	const { tag, name, email, password } = joinFields.data

	const joinResponse = await fetchWithValidation(`/api/users`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		cache: 'no-cache',
		body: {
			tag,
			name,
			email,
			password,
		},
		bodySchema: AuthJoinBodySchema,
	})

	if (joinResponse.status === 'error') {
		return {
			data: {
				email: formData.get('email')?.toString(),
				password: formData.get('password')?.toString(),
			},
			message: joinResponse.message,
		}
	}

	return {
		data: {
			email: formData.get('email')?.toString(),
			password: formData.get('password')?.toString(),
		},
		message: joinResponse.message,
		isJoin: true,
	}
}
