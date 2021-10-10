import { ImageCategory } from '@app/shared/enums/image-category.enum';

export interface ImageDetailsModel {
  category: ImageCategory;
  title: string;
  description: string;
  credits: string;
}
