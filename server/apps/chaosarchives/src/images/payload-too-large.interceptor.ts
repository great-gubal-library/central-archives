
import { serverConfiguration } from '@app/configuration';
import { CallHandler, ExecutionContext, HttpException, HttpStatus, NestInterceptor, PayloadTooLargeException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

export class PayloadTooLargeInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle()
      .pipe(catchError((error => {
        if (error instanceof PayloadTooLargeException) {
					const maxSize = serverConfiguration.maxUploadSizeKiB;
          throw new HttpException(
						`Your image is too large. Maximum allowed size is ${maxSize} KiB.`, HttpStatus.PAYLOAD_TOO_LARGE);
        } else {
          throw error;
        }
      })));
  }
}
