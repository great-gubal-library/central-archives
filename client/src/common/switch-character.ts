import { SessionCharacterDto } from '@app/shared/dto/user/session-character.dto';
import { Dialog } from 'quasar';
import { useRouter } from 'src/router';

export async function switchCharacter() {
	const router = useRouter();
	const SwitchCharacterDialog = (await import('components/character/SwitchCharacterDialog.vue')).default;

	Dialog.create({
		component: SwitchCharacterDialog
	}).onOk((character: SessionCharacterDto) => {
		if (character.verified) {
			void router.push('/');
		} else {
			void router.push('/verify');
		}
	});
}
