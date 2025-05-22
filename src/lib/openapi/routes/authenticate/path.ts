import { RESPONSE_CODE } from '@/src/lib/constants/responseCode'
import {
	ErrorResponseSchema,
	SuccessResponseSchema,
} from '@/src/lib/schemas/api.schema'
import {
	AuthGetProfilesBodySchema,
	AuthGetProfilesResponseSchema,
} from '@/src/lib/schemas/auth.schema'
import { ZodOpenApiPathsObject } from 'zod-openapi'

export const authenticatePath: ZodOpenApiPathsObject = {
	'/authenticate': {
		post: {
			requestBody: {
				content: {
					'application/json': {
						schema: AuthGetProfilesBodySchema,
					},
				},
			},
			responses: {
				200: {
					description: 'API 응답 / 성공',
					content: {
						'application/json': {
							schema: SuccessResponseSchema(AuthGetProfilesResponseSchema),
							examples: {
								successWithData: {
									description: '요청 성공시 전송되는 데이터입니다.',
									summary: '정상적인 요청 응답 예시',
									value: {
										status: 'success',
										code: RESPONSE_CODE.AUTH.GET_PROFILES_SUCCESS,
										message: '성공',
										data: {
											id: '1',
											image: '/image/profile/default.png',
											tag: 'test1',
											name: '테스트계정',
											statusType: 'common',
											statusId: '1',
											information: '설명글입니다.',
											isCompany: false,
											isOnline: false,
											createdAt: new Date(),
										},
									},
								},
							},
						},
					},
				},
				400: {
					description: 'API 응답 / 올바르지 않은 인자',
					content: {
						'application/json': {
							schema: ErrorResponseSchema,
							examples: {
								errorBody: {
									description:
										'Body 의 데이터가 올바르지 않을 때 전송되는 데이터 입니다.',
									summary: '올바르지 않은 인자 / Body',
									value: {
										status: 'error',
										code: RESPONSE_CODE.AUTH.GET_PROFILES_BODY_INVALID,
										message: 'Body 의 형식이 잘못되었습니다.',
									},
								},
								errorBodyEmail: {
									description:
										'Body > email 의 데이터가 올바르지 않을 때 전송되는 데이터 입니다.',
									summary: '올바르지 않은 인자 / Body > email',
									value: {
										status: 'error',
										code: RESPONSE_CODE.AUTH.GET_PROFILES_BODY_INVALID_EMAIL,
										message: 'Body > email 의 형식이 잘못되었습니다.',
									},
								},
								errorBodyPassword: {
									description:
										'Body > password 의 데이터가 올바르지 않을 때 전송되는 데이터 입니다.',
									summary: '올바르지 않은 인자 / Body > password',
									value: {
										status: 'error',
										code: RESPONSE_CODE.AUTH.GET_PROFILES_BODY_INVALID_PASSWORD,
										message: 'Body > password 의 형식이 잘못되었습니다.',
									},
								},
							},
						},
					},
				},
				500: {
					description: 'API 응답 / 서버 내부 오류',
					content: {
						'application/json': {
							schema: ErrorResponseSchema,
							examples: {
								error: {
									description:
										'서버 내부에서 오류가 발생하여 전송되는 데이터 입니다.',
									summary: '서버 내부 오류 응답 예시',
									value: {
										status: 'error',
										code: RESPONSE_CODE.INTERNAL_SERVER_ERROR,
										message: '서버 내부에서 오류가 발생하였습니다.',
									},
								},
							},
						},
					},
				},
			},
		},
	},
}
