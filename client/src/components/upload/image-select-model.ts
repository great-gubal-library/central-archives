import { ImageFormat } from '@app/shared/enums/image-format.enum';

export interface ImageSelectModel {
	file: File|null;
	filename: string|null;
	convertedFile: Blob|null;
	image: HTMLImageElement|null;
	originalFormat: ImageFormat|null;
	format: ImageFormat|null;
}
