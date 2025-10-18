const size = 30;

export default async function circleImage(url: string) {
    let img = await new Promise<HTMLImageElement>((resolve, reject) => {
        let i = new Image();
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = url;
    });

    let cropSize = Math.min(img.width, img.height);
    let sx = (img.width - cropSize) / 2;
    let sy = (img.height - cropSize) / 2;

    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    canvas.width = size;
    canvas.height = size;
	let radius = size / 2;

    ctx.beginPath();
    ctx.arc(radius, radius, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(img, sx, sy, cropSize, cropSize, 0, 0, size, size);

    let blob = await new Promise<Blob>(resolve => canvas.toBlob(resolve, 'image/png'));
    return URL.createObjectURL(blob);
}