import sharp from 'sharp';
import path from 'path';

const CHAR = 'C:/Users/user/OneDrive/Desktop/Contradiction of S AR project/web/assets/character';
const OUT = 'C:/Users/user/OneDrive/Desktop/Contradiction of S AR project/swim-app/public/textures/pool';
const W = 300, H = 440;

// per-category placement boxes (preset 1) from character-build.js
async function layer(file, box) {
  const buf = await sharp(path.join(CHAR, file))
    .resize(box.w, box.h, { fit: 'fill' })
    .png()
    .toBuffer();
  return { input: buf, left: box.x, top: box.y };
}

async function build(outName, parts) {
  const comps = [];
  // z-order: body, bottoms, tops, face, hair-top
  comps.push(await layer(parts.body, { x: 20, y: 10, w: 260, h: 420 }));
  comps.push(await layer(parts.bottom, { x: 40, y: 230, w: 220, h: 195 }));
  comps.push(await layer(parts.top, { x: 30, y: 115, w: 240, h: 170 }));
  comps.push(await layer(parts.face, { x: 55, y: 20, w: 190, h: 190 }));
  comps.push(await layer(parts.hair, { x: 40, y: 0, w: 220, h: 180 }));
  await sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite(comps)
    .png()
    .toFile(path.join(OUT, outName));
  console.log('wrote', outName);
}

await build('swimmer1.png', {
  body: 'body-skeleton.png', bottom: 'bottom-skirt-1.png',
  top: 'top-tshirt-1.png', face: 'face-1.png', hair: 'hair-1.png',
});
await build('swimmer2.png', {
  body: 'body-skeleton.png', bottom: 'bottom-pants-1.png',
  top: 'top-dress-1.png', face: 'face-2.png', hair: 'hair-1.png',
});
console.log('done');
