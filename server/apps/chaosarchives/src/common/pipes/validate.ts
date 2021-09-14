import { ValidationPipe } from '@nestjs/common';

export const transformAndValidate = new ValidationPipe({ transform: true, whitelist: true });
