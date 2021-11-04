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
  hasTransparency: boolean;
}

export async function convertImageElementForUpload(
  image: HTMLImageElement,
  filename: string,
  format: ImageFormat
): Promise<ImageConversionResult> {
  const g = createCanvas(image);

  return new Promise((resolve, reject) => {
    const newFilename = replaceExtension(
      filename,
      format == ImageFormat.PNG ? 'png' : 'jpg'
    );
    g.canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve({
            blob,
            filename: newFilename,
            hasTransparency: checkTransparency(g)
          });
        } else {
          reject(new Error('Cannot convert image'));
        }
      },
      format == ImageFormat.PNG ? 'image/png' : 'image/jpeg'
    );
  });
}

export function hasTransparency(image: HTMLImageElement): boolean {
  return checkTransparency(createCanvas(image));
}

// Auxiliary functions

function createCanvas(image: HTMLImageElement): CanvasRenderingContext2D {
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;

  const g = canvas.getContext('2d');

  if (!g) {
    // Cannot happen
    throw new Error('Your browser is ancient');
  }

  g.drawImage(image, 0, 0);
  return g;
}

function checkTransparency(g: CanvasRenderingContext2D): boolean {
  const imageData = g.getImageData(0, 0, g.canvas.width, g.canvas.height).data;
  
  // imageData contains pixel data as bytes in RGBA order, so we check every 4th byte (alpha)
  for (let i = 3; i < imageData.length; i += 4) {
    if (imageData[i] !== 255) {
      // not an entirely opaque pixel
      return true;
    }
  }

  return false;
}

function replaceExtension(filename: string, extension: string): string {
  const lastDot = filename.lastIndexOf('.');

  if (lastDot === -1) {
    return filename + '.' + extension;
  }

  return filename.slice(0, lastDot + 1) + extension;
}
