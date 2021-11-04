import { ImageFormat } from '@app/shared/enums/image-format.enum';

export async function readImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.onload = () => {
      const imageData = fileReader.result as string;
      const image = new Image();

      image.onload = () => {
        resolve(image);
      };

      image.onerror = () => {
        reject(new Error('Error loading image'));
      };

      image.src = imageData;
    };

    fileReader.onerror = () => {
      reject(fileReader.error);
    };

    fileReader.readAsDataURL(blob);
  });
}

export interface ImageConversionResult {
  filename: string;
  blob: Blob;
}

function replaceExtension(filename: string, extension: string): string {
  const lastDot = filename.lastIndexOf('.');

  if (lastDot === -1) {
    return filename + '.' + extension;
  }

  return filename.slice(0, lastDot + 1) + extension;
}

export async function convertImageForUpload(
  file: File,
  format: ImageFormat = ImageFormat.PNG
): Promise<ImageConversionResult> {
  if (file.type === 'image/jpeg' || file.type === 'image/png') {
    return {
      filename: file.name,
      blob: file,
    };
  }

  return convertImageElementForUpload(await readImage(file), file.name, format);
}

export async function convertImageElementForUpload(
  image: HTMLImageElement,
  filename: string,
  format: ImageFormat
): Promise<ImageConversionResult> {
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;

  const g = canvas.getContext('2d');

  if (!g) {
    // Cannot happen
    throw new Error('Your browser is ancient');
  }

  g.drawImage(image, 0, 0);

  return new Promise((resolve, reject) => {
    const newFilename = replaceExtension(
      filename,
      format == ImageFormat.PNG ? 'png' : 'jpg'
    );
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve({ blob, filename: newFilename });
        } else {
          reject(new Error('Cannot convert image'));
        }
      },
      format == ImageFormat.PNG ? 'image/png' : 'image/jpeg'
    );
  });
}
