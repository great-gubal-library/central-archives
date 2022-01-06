import { ImageCategory } from "@app/shared/enums/image-category.enum";

export interface ImageDto {
  id: number;
  url: string;
  thumbUrl: string;
  filename: string;
  title: string;
  description: string;
  credits: string;
  category: ImageCategory;
  width: number;
  height: number;
  createdAt: number;
  author: string;
  authorServer: string;
  eventId: number|null;
  eventTitle: string|null;
}
