import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from "@nestjs/common";
import { QueryFailedError } from "typeorm";
import { isQueryFailedError } from "./common/db";

@Catch(QueryFailedError)
export class GlobalExceptionsFilter implements ExceptionFilter {
	private readonly log = new Logger(GlobalExceptionsFilter.name);

  catch(e: QueryFailedError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse();

    if (isQueryFailedError(e) && e.code === 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD') {
			response.status(HttpStatus.BAD_REQUEST).json({
				statusCode: HttpStatus.BAD_REQUEST,
				message: 'Sorry, emoji and other non-text characters are disabled. Please remove them and try again.',
			});
		} else {
			this.log.error(e.message, e.stack);

			response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
				statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
				message: 'Internal database error. Please contact the administrator for help.',
			});
		}
  }
}
