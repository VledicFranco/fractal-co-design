#!/usr/bin/env node
/**
 * gen-og-image.mjs
 *
 * Produces a minimal 256x256 PNG with the text "FCD" centered. Zero external
 * deps — writes the PNG bytes by hand. The image is intentionally simple
 * (solid background + glyph rendering driven by a tiny pixel font) because
 * v0.1 just needs a valid OG image; v0.2 will replace this with a real
 * design asset.
 *
 * Run: node scripts/gen-og-image.mjs
 * Output: public/og-image.png
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const W = 256;
const H = 256;
const BG = [15, 23, 42];        // slate-900
const FG = [34, 211, 238];      // cyan-400 — matches favicon

// 5x7 pixel font for "F", "C", "D" only (each glyph is 5 wide, 7 tall).
// 1 = ink, 0 = background.
const GLYPHS = {
  F: [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
  ],
  C: [
    [0, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [0, 1, 1, 1, 1],
  ],
  D: [
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 0],
  ],
};

// Allocate raw RGBA buffer (W * H * 4 bytes).
const pixels = Buffer.alloc(W * H * 4);
for (let i = 0; i < W * H; i++) {
  pixels[i * 4 + 0] = BG[0];
  pixels[i * 4 + 1] = BG[1];
  pixels[i * 4 + 2] = BG[2];
  pixels[i * 4 + 3] = 255;
}

// Render "FCD" centered. Each glyph is 5x7 pixels; we scale by 16 to make
// them visible. Total text width: 3 glyphs * 5 + 2 gaps * 1 = 17 base units,
// scaled to 17 * 16 = 272. Slightly wider than 256, so we use scale 14.
const TEXT = ['F', 'C', 'D'];
const GLYPH_W = 5;
const GLYPH_H = 7;
const GAP = 1;
const SCALE = 14;
const textW = (TEXT.length * GLYPH_W + (TEXT.length - 1) * GAP) * SCALE;
const textH = GLYPH_H * SCALE;
const startX = Math.floor((W - textW) / 2);
const startY = Math.floor((H - textH) / 2);

function setPixel(x, y) {
  if (x < 0 || x >= W || y < 0 || y >= H) return;
  const idx = (y * W + x) * 4;
  pixels[idx + 0] = FG[0];
  pixels[idx + 1] = FG[1];
  pixels[idx + 2] = FG[2];
  pixels[idx + 3] = 255;
}

for (let g = 0; g < TEXT.length; g++) {
  const glyph = GLYPHS[TEXT[g]];
  const gx = startX + g * (GLYPH_W + GAP) * SCALE;
  for (let row = 0; row < GLYPH_H; row++) {
    for (let col = 0; col < GLYPH_W; col++) {
      if (!glyph[row][col]) continue;
      // Fill the SCALE x SCALE pixel block.
      for (let dy = 0; dy < SCALE; dy++) {
        for (let dx = 0; dx < SCALE; dx++) {
          setPixel(gx + col * SCALE + dx, startY + row * SCALE + dy);
        }
      }
    }
  }
}

// --- Encode as PNG (uncompressed-ish IDAT via zlib deflate). ---

function crc32(buf) {
  let c;
  let crcTable = crc32.table;
  if (!crcTable) {
    crcTable = new Array(256);
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      crcTable[n] = c >>> 0;
    }
    crc32.table = crcTable;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

const SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr.writeUInt8(8, 8);    // bit depth
ihdr.writeUInt8(6, 9);    // color type RGBA
ihdr.writeUInt8(0, 10);   // compression
ihdr.writeUInt8(0, 11);   // filter
ihdr.writeUInt8(0, 12);   // interlace

// Filter byte 0 prefixed to each scanline.
const scanlines = Buffer.alloc(H * (1 + W * 4));
for (let y = 0; y < H; y++) {
  scanlines[y * (1 + W * 4)] = 0;
  pixels.copy(scanlines, y * (1 + W * 4) + 1, y * W * 4, (y + 1) * W * 4);
}
const idatData = zlib.deflateSync(scanlines);

const png = Buffer.concat([
  SIGNATURE,
  chunk('IHDR', ihdr),
  chunk('IDAT', idatData),
  chunk('IEND', Buffer.alloc(0)),
]);

const outPath = path.resolve(__dirname, '..', 'public', 'og-image.png');
await fs.writeFile(outPath, png);
console.log(`[gen-og-image] wrote ${outPath} (${png.length} bytes)`);
