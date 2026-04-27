import sharp from "sharp";
import { readFile, writeFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "public", "images");

/** @type {{ dir: string; name: string; ext: string }[]} */
const jobs = [
  { dir: "approach", name: "im-photo1", ext: "png" },
  { dir: "approach", name: "im-photo2", ext: "png" },
  { dir: "approach", name: "visual-pc", ext: "png" },
  { dir: "approach", name: "guidi-photo", ext: "jpg" },
];
const maxWidth = 2000;

const sizeOf = async (p) => (await stat(p)).size;
const fmt = (n) => `${(n / 1024 / 1024).toFixed(2)} MB`;

for (const { dir, name, ext } of jobs) {
  const folder = join(root, dir);
  const input = join(folder, `${name}.${ext}`);
  const avifOut = join(folder, `${name}.avif`);
  const webpOut = join(folder, `${name}.webp`);

  const src = await readFile(input);
  const meta = await sharp(src).metadata();
  const resizeOpts = meta.width && meta.width > maxWidth ? { width: maxWidth } : undefined;

  const avifBuf = await sharp(src).resize(resizeOpts).avif({ quality: 50, effort: 6 }).toBuffer();
  await writeFile(avifOut, avifBuf);

  const webpBuf = await sharp(src).resize(resizeOpts).webp({ quality: 78, effort: 6 }).toBuffer();
  await writeFile(webpOut, webpBuf);

  const orig = await sizeOf(input);
  const avif = await sizeOf(avifOut);
  const webp = await sizeOf(webpOut);
  const origDim = `${meta.width}x${meta.height}`;
  const newDim = resizeOpts ? `${maxWidth}x${Math.round((meta.height * maxWidth) / meta.width)}` : origDim;

  console.log(
    `${dir}/${name}: ${origDim} ${ext.toUpperCase()} ${fmt(orig)}  →  ${newDim} AVIF ${fmt(avif)} / WebP ${fmt(webp)}`
  );
}
