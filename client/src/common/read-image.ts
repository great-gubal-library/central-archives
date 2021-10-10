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
