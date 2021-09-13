import { AxiosError } from 'axios';

interface ServerError {
	statusCode: number;
	message: string;
}

const errors = {
	getMessage(e: unknown): string {
		if (e instanceof Error) {
			const axiosError = e as AxiosError;

			if (axiosError.response && Math.trunc(axiosError.response.status / 100) == 4) {
				// Client error, try to extract message
				const errorBody = axiosError.response.data as ServerError;

				if (errorBody.message) {
					return errorBody.message;
				}
			}
			
			return e.message;
		}
		
		return '';
	}
};

export default errors;