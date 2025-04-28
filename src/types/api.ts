export interface ApiResponse<T> {
	status: 'success' | 'error'
	code: number
	message: string
	data?: T
}

export interface SuccessResponse<T = any> {
	status: 'success'
	code: number
	message: string
  data?: T
}

export interface ErrorResponse {
	status: 'error'
	code: number
	message: string
	errors?: Record<string, any>
}