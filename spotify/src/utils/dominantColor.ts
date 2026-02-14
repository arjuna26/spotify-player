/**
 * Load an image from URL (with CORS) and return the dominant color as hex.
 * Uses a small canvas to sample pixels and picks the most frequent bucket.
 */
export function getDominantColor(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const color = extractDominantColor(img);
        resolve(color);
      } catch (e) {
        reject(e);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image for color extraction'));

    img.src = imageUrl;
  });
}

function extractDominantColor(img: HTMLImageElement): string {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2d not available');

  ctx.drawImage(img, 0, 0, size, size);
  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;

  const counts: Record<string, number> = {};

  for (let i = 0; i < data.length; i += 4) {
    const r = (data[i] ?? 0) >> 3;     // 5-bit
    const g = (data[i + 1] ?? 0) >> 3;
    const b = (data[i + 2] ?? 0) >> 3;
    const a = data[i + 3] ?? 255;
    if (a < 128) continue;

    const key = `${r},${g},${b}`;
    counts[key] = (counts[key] ?? 0) + 1;
  }

  let maxCount = 0;
  let dominantKey = '0,0,0';

  for (const [key, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      dominantKey = key;
    }
  }

  const [r, g, b] = dominantKey.split(',').map(Number);
  const r8 = (r << 3) + 4;
  const g8 = (g << 3) + 4;
  const b8 = (b << 3) + 4;

  return (
    '#' +
    [r8, g8, b8]
      .map((x) => Math.min(255, x).toString(16).padStart(2, '0'))
      .join('')
  );
}
