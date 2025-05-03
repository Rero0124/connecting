import {
	JoinFormState,
	LoginFormState,
	JoinFormSchema,
	LoginFormSchema,
} from '@/src/lib/definitions'
import { VerifySessionType } from '@/src/lib/session'
import { ErrorResponse, ProfileList, SuccessResponse } from '@/src/types/api'
import { redirect } from 'next/navigation'

export async function login(
	state: LoginFormState,
	formData: FormData
): Promise<LoginFormState> {
	const validatedFields = LoginFormSchema.safeParse({
		profileId: formData.get('profileId'),
		email: formData.get('email'),
		password: formData.get('password'),
	})

	if (!validatedFields.success) {
		return {
			data: {
				email: formData.get('email')?.toString(),
				password: formData.get('password')?.toString(),
			},
			errors: validatedFields.error.flatten().fieldErrors,
		}
	}

	const { email, password, profileId } = validatedFields.data

	if (profileId > 0) {
		const sessionResponse: SuccessResponse<VerifySessionType> | ErrorResponse =
			await fetch(`${process.env.NEXT_PUBLIC_API_URL}/session`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				cache: 'force-cache',
				body: JSON.stringify({
					email,
					password,
					profileId,
				}),
			}).then((res) => res.json())

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
	}

	const authenticateResponse: SuccessResponse<ProfileList> | ErrorResponse =
		await fetch(`${process.env.NEXT_PUBLIC_API_URL}/authenticate`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			cache: 'force-cache',
			body: JSON.stringify({
				email,
				password,
			}),
		}).then((res) => res.json())

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

export async function join(
	state: JoinFormState,
	formData: FormData
): Promise<JoinFormState> {
	const validatedFields = JoinFormSchema.safeParse({
		tag: formData.get('tag'),
		name: formData.get('name'),
		email: formData.get('email'),
		password: formData.get('password'),
	})

	if (!validatedFields.success) {
		return {
			data: {
				tag: formData.get('tag')?.toString(),
				name: formData.get('name')?.toString(),
				email: formData.get('email')?.toString(),
				password: formData.get('password')?.toString(),
			},
			errors: validatedFields.error.flatten().fieldErrors,
		}
	}

	const { tag, name, email, password } = validatedFields.data

	const userResponse: SuccessResponse | ErrorResponse = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}/users`,
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			cache: 'no-cache',
			body: JSON.stringify({
				tag,
				name,
				email,
				password,
			}),
		}
	).then((res) => res.json())

	if (userResponse.status === 'error') {
		return {
			data: {
				email: formData.get('email')?.toString(),
				password: formData.get('password')?.toString(),
			},
			message: userResponse.message,
		}
	}

	return {
		data: {
			email: formData.get('email')?.toString(),
			password: formData.get('password')?.toString(),
		},
		message: userResponse.message,
		isJoin: true,
	}
}
