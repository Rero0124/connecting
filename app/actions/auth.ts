import { JoinFormState, LoginFormState } from '@/src/lib/form/auth'
import {
	AuthGetProfilesBodySchema,
	AuthGetProfilesInputSchema,
	AuthGetProfilesResponseSchema,
	AuthJoinBodySchema,
	AuthJoinInputSchema,
	AuthLoginBodySchema,
	AuthLoginInputSchema,
} from '@/src/lib/schemas/auth.schema'
import { fetchWithZod } from '@/src/lib/util'

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

	if (loginFields.success) {
		const { email, password, profileId } = loginFields.data

		const sessionResponse = await fetchWithZod(
			`${process.env.NEXT_PUBLIC_API_URL}/session`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				cache: 'force-cache',
				body: {
					email,
					password,
					profileId,
				},
				bodySchema: AuthLoginBodySchema,
			}
		)

		if (sessionResponse.status === 'error') {
			return {
				data: {
					email: formData.get('email')?.toString(),
					password: formData.get('password')?.toString(),
				},
				message: sessionResponse.message,
			}
		}

		return {
			data: {
				email: formData.get('email')?.toString(),
				password: formData.get('password')?.toString(),
			},
			message: sessionResponse.message,
			isLogin: true,
		}
	} else {
		const { email, password } = getProfilesFields.data

		const authenticateResponse = await fetchWithZod(
			`${process.env.NEXT_PUBLIC_API_URL}/authenticate`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				cache: 'force-cache',
				body: {
					email,
					password,
				},
				dataSchema: AuthGetProfilesResponseSchema,
				bodySchema: AuthGetProfilesBodySchema,
			}
		)

		if (authenticateResponse.status === 'error') {
			return {
				data: {
					email: formData.get('email')?.toString(),
					password: formData.get('password')?.toString(),
				},
				message: authenticateResponse.message,
			}
		}

		return {
			data: {
				email: formData.get('email')?.toString(),
				password: formData.get('password')?.toString(),
			},
			message: authenticateResponse.message,
			profiles: authenticateResponse.data,
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

	const joinResponse = await fetchWithZod(
		`${process.env.NEXT_PUBLIC_API_URL}/users`,
		{
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
		}
	)

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
