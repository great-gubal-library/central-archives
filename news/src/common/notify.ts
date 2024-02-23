import errors from '@app/shared/errors';
import { Notify } from 'quasar';

export function notifySuccess(message: string, action?: { label: string, color: string, handler: () => void }) {
	Notify.create({
		type: 'positive',
		message,
		...(action ? { actions: [ action ] } : {})
	});
}

export function notifyError(e: unknown) {
	Notify.create({
		type: 'negative',
		message: typeof e === 'string' ? e : errors.getMessage(e),
	});
}
