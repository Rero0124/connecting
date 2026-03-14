'use server'

import { JoinFormState, LoginFormState } from '@/src/lib/form/auth'
import prisma from '@/src/lib/prisma'
import {
	AuthGetProfilesInputSchema,
	AuthJoinInputSchema,
	AuthLoginInputSchema,
} from '@/src/lib/schemas/auth.schema'
import { getAuthUserProfiles } from '@/src/lib/serverUtil'
import { createSession } from '@/src/lib/session'
import bcryptjs from 'bcryptjs'

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

	let user
	try {
		const hashedPassword = await bcryptjs.hash(password, 10)

		user = await prisma.user.create({
			data: { email, password: hashedPassword },
		})

		await prisma.profile.create({
			data: {
				tag,
				userId: user.id,
				name,
				information: '',
				statusType: 'common',
				statusId: 0,
			},
		})

		return {
			data: {
				email: formData.get('email')?.toString(),
				password: formData.get('password')?.toString(),
			},
			message: '회원가입에 성공했습니다.',
			isJoin: true,
		}
	} catch {
		if (user) {
			await prisma.user.delete({ where: { id: user.id } })
		}

		return {
			data: {
				email: formData.get('email')?.toString(),
				password: formData.get('password')?.toString(),
			},
			message: '회원가입에 실패했습니다. 이미 사용 중인 이메일일 수 있습니다.',
		}
	}
}
