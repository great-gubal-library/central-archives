import { SessionCharacterDto } from '@app/shared/dto/user/session-character.dto';
import { Region, SiteRegion, asSiteRegion } from '@app/shared/enums/region.enum';
import { Dialog } from 'quasar';
import { useRegion } from 'src/boot/region';
import { useRouter } from 'src/router';
import { hsspRedirect } from './hssp';

export async function switchCharacter() {
	const router = useRouter();
	const SwitchCharacterDialog = (await import('components/character/SwitchCharacterDialog.vue')).default;

	Dialog.create({
		component: SwitchCharacterDialog
	}).onOk((character: SessionCharacterDto) => {
    const redirectPath = character.verified ? '/' : '/verify';
    const $region = useRegion();
    const isSameRegion = $region === SiteRegion.GLOBAL || asSiteRegion(character.region) === $region;

		if (isSameRegion) {
      void router.push(redirectPath);
    } else {
      let newRegion: SiteRegion;

      if ([Region.EU, Region.NA].includes(character.region)) {
        newRegion = asSiteRegion(character.region);
      } else {
        newRegion = SiteRegion.GLOBAL;
      }

      hsspRedirect(newRegion, redirectPath, character.id);
    }
	});
}
