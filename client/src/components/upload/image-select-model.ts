import { ImageFormat } from '@app/shared/enums/image-format.enum';

export interface ImageSelectModel {
	file: File|null;
	filename: string|null;
	convertedFile: Blob|null;
	image: HTMLImageElement|null;
	originalFormat: ImageFormat|null;
	format: ImageFormat|null;
	hasTransparency: boolean;
}

export function defaultImageSelectModel() {
	return {
		file: null,
		filename: null,
		image: null,
		originalFormat: null,
		format: null,
		convertedFile: null,
		hasTransparency: false,
	}
}
