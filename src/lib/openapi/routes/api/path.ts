import { RESPONSE_CODE } from '@/src/lib/constants/responseCode'
import {
	ErrorResponseSchema,
	SuccessResponseSchema,
} from '@/src/lib/schemas/api.schema'
import { z } from 'zod'
import { ZodOpenApiPathsObject } from 'zod-openapi'

export const apiPath: ZodOpenApiPathsObject = {
	'/api': {
		get: {
			responses: {
				200: {
					description: 'API 응답 / 성공',
					content: {
						'application/json': {
							schema: SuccessResponseSchema().extend({
								data: z.object({}),
							}),
							examples: {
								successWithData: {
									description: '요청 성공시 전송되는 데이터입니다.',
									summary: '정상적인 요청 응답 예시(데이터 포함)',
									value: {
										status: 'success',
										code: 0x0000001,
										message: '성공',
										data: {
											hello: 'world',
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
								error: {
									description:
										'올바르지 않은 인자 포함 시 전송되는 데이터 입니다.',
									summary: '올바르지 않은 인자 응답 예시',
									value: {
										status: 'error',
										code: 0x1000001,
										message:
											'Params > userId 의 형식이 잘못되었습니다. (1 ~ 9223372036854775807)',
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
		post: {
			responses: {
				200: {
					description: 'API 응답 / 성공',
					content: {
						'application/json': {
							schema: SuccessResponseSchema().extend({
								data: z.object({}).optional(),
							}),
							examples: {
								successWithData: {
									description: '요청 성공시 전송되는 데이터입니다.',
									summary: '정상적인 요청 응답 예시(데이터 포함)',
									value: {
										status: 'success',
										code: 200,
										message: '성공',
										data: {
											hello: 'world',
										},
									},
								},
								success: {
									description: '요청 성공시 전송되는 데이터입니다.',
									summary: '정상적인 요청 응답 예시(데이터 미포함)',
									value: {
										status: 'success',
										code: 0x0000001,
										message: '성공',
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
								error: {
									description:
										'올바르지 않은 인자 포함 시 전송되는 데이터 입니다.',
									summary: '올바르지 않은 인자 응답 예시',
									value: {
										status: 'error',
										code: 0x1000001,
										message:
											'Params > userId 의 형식이 잘못되었습니다. (1 ~ 9223372036854775807)',
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
		patch: {
			responses: {
				200: {
					description: 'API 응답 / 성공',
					content: {
						'application/json': {
							schema: SuccessResponseSchema().extend({
								data: z.object({}).optional(),
							}),
							examples: {
								success: {
									description: '요청 성공시 전송되는 데이터입니다.',
									summary: '정상적인 요청 응답 예시(데이터 미포함)',
									value: {
										status: 'success',
										code: 0x0000001,
										message: '성공',
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
								error: {
									description:
										'올바르지 않은 인자 포함 시 전송되는 데이터 입니다.',
									summary: '올바르지 않은 인자 응답 예시',
									value: {
										status: 'error',
										code: 0x1000001,
										message:
											'Params > userId 의 형식이 잘못되었습니다. (0 ~ 9223372036854775807)',
									},
								},
							},
						},
					},
				},
				404: {
					description: 'API 응답 / 대상 없음',
					content: {
						'application/json': {
							schema: ErrorResponseSchema,
							examples: {
								error: {
									description:
										'데이터를 업데이트 할 대상이 없을 때 전송되는 데이터 입니다.',
									summary: '대상 없음 응답 예시',
									value: {
										status: 'error',
										code: 0x1000003,
										message: '업데이트할 user 가 존재하지 않습니다. userId: 3',
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
		delete: {
			responses: {
				200: {
					description: 'API 응답 / 성공',
					content: {
						'application/json': {
							schema: SuccessResponseSchema().extend({
								data: z.object({}).optional(),
							}),
							examples: {
								success: {
									description: '요청 성공시 전송되는 데이터입니다.',
									summary: '정상적인 요청 응답 예시(데이터 미포함)',
									value: {
										status: 'success',
										code: 0x0000001,
										message: '성공',
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
								error: {
									description:
										'올바르지 않은 인자 포함 시 전송되는 데이터 입니다.',
									summary: '올바르지 않은 인자 응답 예시',
									value: {
										status: 'error',
										code: 0x1000001,
										message:
											'Params > userId 의 형식이 잘못되었습니다. (0 ~ 9223372036854775807)',
									},
								},
							},
						},
					},
				},
				404: {
					description: 'API 응답 / 대상 없음',
					content: {
						'application/json': {
							schema: ErrorResponseSchema,
							examples: {
								error: {
									description:
										'데이터를 삭제할 대상이 없을 때 전송되는 데이터 입니다.',
									summary: '대상 없음 응답 예시',
									value: {
										status: 'error',
										code: 0x1000003,
										message: '삭제할 user 가 존재하지 않습니다. userId: 3',
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
