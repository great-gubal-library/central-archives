
import SharedConstants from '@app/shared/shared-constants';
import { CallHandler, ExecutionContext, HttpException, HttpStatus, NestInterceptor, PayloadTooLargeException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

export class PayloadTooLargeInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle()
      .pipe(catchError((error => {
        if (error instanceof PayloadTooLargeException) {
					const maxSize = SharedConstants.MAX_UPLOAD_SIZE;
          throw new HttpException(
						`Your image is too large. Maximum allowed size is ${maxSize} KiB.`, HttpStatus.PAYLOAD_TOO_LARGE);
        } else {
          throw error;
        }
      })));
  }
}
