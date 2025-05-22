// auto-generated openapi route file for /dm-sessions\[dmSessionId]\participants\[profileId]
import { RESPONSE_CODE } from '@/src/lib/constants/responseCode'
import {
	ErrorResponseSchema,
	SuccessResponseSchema,
} from '@/src/lib/schemas/api.schema'
import {
	CreateDmParticipantBodySchema,
	CreateDmParticipantParamsSchema,
	DeleteDmParticipantParamsSchema,
} from '@/src/lib/schemas/dm.schema'
import { ZodOpenApiPathsObject } from 'zod-openapi'

export const dmParticipantsByProfileIdPath: ZodOpenApiPathsObject = {
	'/dm-sessions/{dmSessionId}/participants/{profileId}': {
		delete: {
			requestParams: {
				path: DeleteDmParticipantParamsSchema,
			},
			responses: {
				200: {
					description: 'API 응답 / 성공',
					content: {
						'application/json': {
							schema: SuccessResponseSchema(),
							examples: {
								success: {
									description: '요청 성공시 전송되는 데이터입니다.',
									summary: '정상적인 요청 응답',
									value: {
										status: 'success',
										code: RESPONSE_CODE.DM.DELETE_DM_PARTICIPANT_SUCCESS,
										message: 'DM에서 해당 참여자를 삭제하였습니다.',
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
								errorParams: {
									description:
										'Params 의 데이터가 올바르지 않을 때 전송되는 데이터 입니다.',
									summary: '올바르지 않은 인자 / Params',
									value: {
										status: 'error',
										code: RESPONSE_CODE.DM.DELETE_DM_PARTICIPANT_PARAMS_INVALID,
										message: 'Params 의 형식이 잘못되었습니다.',
									},
								},
								errorParamsDmSessionId: {
									description:
										'Params > dmSessionId 의 데이터가 올바르지 않을 때 전송되는 데이터 입니다.',
									summary: '올바르지 않은 인자 / Params > dmSessionId',
									value: {
										status: 'error',
										code: RESPONSE_CODE.DM
											.DELETE_DM_PARTICIPANT_PARAMS_INVALID_DM_SESSION_ID,
										message:
											'Params > dmSessionId 의 형식이 잘못되었습니다. (cuid)',
									},
								},
								errorParamsProfileId: {
									description:
										'Params > dmSessionId 의 데이터가 올바르지 않을 때 전송되는 데이터 입니다.',
									summary: '올바르지 않은 인자 / Params > profileId',
									value: {
										status: 'error',
										code: RESPONSE_CODE.DM
											.DELETE_DM_PARTICIPANT_PARAMS_INVALID_PROFILE_ID,
										message:
											'Params > profileId 의 형식이 잘못되었습니다. (1 ~ 9223372036854775807)',
									},
								},
							},
						},
					},
				},
				403: {
					description: 'API 응답 / 권한 없음',
					content: {
						'application/json': {
							schema: ErrorResponseSchema,
							examples: {
								errorDmSessionId: {
									description:
										'DmSession 에 참여 중이 아닐 때 전송되는 데이터 입니다.',
									summary: '권한 없음 / DmSession',
									value: {
										status: 'error',
										code: RESPONSE_CODE.DM
											.DELETE_DM_PARTICIPANT_DM_SESSION_NOT_JOIN,
										message: 'DmSession 에 참여 중이 아닙니다.',
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
								errorDmSessionId: {
									description:
										'DmSession이 존재하지 않을 때 전송되는 데이터 입니다.',
									summary: '대상 없음 / DmSession',
									value: {
										status: 'error',
										code: RESPONSE_CODE.DM.CREATE_DM_MESSAGE_BODY_INVALID,
										message:
											'해당 DmSession 이 존재하지 않습니다. dmSessionId: cmaug2ord0000a5n4hsabrtd4',
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
									summary: '서버 내부 오류',
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
