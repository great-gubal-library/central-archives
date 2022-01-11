import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { QueryFailedError } from "typeorm";
import { isQueryFailedError } from "./common/db";

@Catch(QueryFailedError)
export class GlobalExceptionsFilter implements ExceptionFilter {
  catch(e: QueryFailedError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse();
    
    if (isQueryFailedError(e) && e.code === 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD') {
			response.status(HttpStatus.BAD_REQUEST).json({
				statusCode: HttpStatus.BAD_REQUEST,
				message: 'Emoji and other non-text characters are forbidden. Please remove them and try again.',
			});
		} else {
			response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
				statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
				message: 'Internal database error. Please contact the Chaos Archives administrator for help.',
			});
		}
  }
}
