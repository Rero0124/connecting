import {
	JoinFormState,
	LoginFormState,
	JoinFormSchema,
	LoginFormSchema,
} from '@/src/lib/definitions'
import { VerifySessionType } from '@/src/lib/session'
import { ErrorResponse, SuccessResponse } from '@/src/types/api'
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
		const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/session`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			cache: 'force-cache',
			body: JSON.stringify({
				profileId,
			}),
		})

		const data: {
			result?: boolean
			message: string
		} = await res.json()

		if (res.status === 200) {
			return {
				data: {
					email: formData.get('email')?.toString(),
					password: formData.get('password')?.toString(),
				},
				message: data.message,
				isLogin: true,
			}
		}

		return {
			data: {
				email: formData.get('email')?.toString(),
				password: formData.get('password')?.toString(),
			},
			message: data.message,
		}
	}

	const sessionResponse: SuccessResponse<VerifySessionType> | ErrorResponse =
		await fetch(`${process.env.NEXT_PUBLIC_API_URL}/session`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			cache: 'force-cache',
			body: JSON.stringify({
				email,
				password,
			}),
		}).then((res) => res.json())

	if (
		sessionResponse.status === 'error' ||
		sessionResponse.data?.authType === 'none'
	) {
		return {
			data: {
				email: formData.get('email')?.toString(),
				password: formData.get('password')?.toString(),
			},
			message: sessionResponse.message,
		}
	}

	const profilesResponse:
		| SuccessResponse<
				{
					tag: string
					name: string | null
					id: number
					userId: number
					statusType: string
					statusId: number
					information: string
					image: string
					isCompany: boolean
					isOnline: boolean
					createdAt: Date
				}[]
		  >
		| ErrorResponse = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}/users/${sessionResponse.data?.userId}/profiles`
	).then((res) => res.json())

	if (profilesResponse.status === 'error') {
		return {
			data: {
				email: formData.get('email')?.toString(),
				password: formData.get('password')?.toString(),
			},
			message: profilesResponse.message,
		}
	}

	return {
		data: {
			email: formData.get('email')?.toString(),
			password: formData.get('password')?.toString(),
		},
		message: profilesResponse.message,
		profiles: profilesResponse.data,
	}
}

export async function join(state: JoinFormState, formData: FormData) {
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

	const data: {
		result?: boolean
		message: string
	} = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/user`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		cache: 'force-cache',
		body: JSON.stringify({
			tag,
			name,
			email,
			password,
		}),
	}).then((res) => {
		if (res.status === 200) {
			redirect('/login')
		}

		return res.json()
	})

	return {
		data: {
			email: formData.get('email')?.toString(),
			password: formData.get('password')?.toString(),
		},
		message: data.message,
	}
}
