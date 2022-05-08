import { ExecutionContext, Injectable } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

@Injectable()
export class OptionalJwtAuthGuard extends JwtAuthGuard {
	async canActivate(context: ExecutionContext): Promise<boolean> {
		try {
			await super.canActivate(context);
		} catch (e) {
			// Do nothing
		}
		return true;
	}
}
