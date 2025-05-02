export interface ApiResponse<T> {
	status: 'success' | 'error'
	code: number
	message: string
	data?: T
}

interface SuccessResponseWithoutData {
	status: 'success'
	code: number
	message: string
}
interface SuccessResponseWithData<T> {
	status: 'success'
	code: number
	message: string,
	data: T
}

export type SuccessResponse<T = void> = T extends void ? SuccessResponseWithoutData : SuccessResponseWithData<T>;

export interface ErrorResponse {
	status: 'error'
	code: number
	message: string
	errors?: Record<string, any>
}