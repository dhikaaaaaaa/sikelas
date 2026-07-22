const fs = require('fs');
const zlib = require('zlib');

// Create a valid 200x200 PNG file buffer with a nice blue background and white pixels
function createValidPNG(width, height) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth
  ihdr[9] = 2; // Color type: Truecolor (RGB)
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

  const ihdrChunk = createChunk('IHDR', ihdr);

  // Raw IDAT uncompressed scanlines
  const lineSize = width * 3 + 1;
  const rawData = Buffer.alloc(height * lineSize);

  for (let y = 0; y < height; y++) {
    const offset = y * lineSize;
    rawData[offset] = 0; // None filter
    for (let x = 0; x < width; x++) {
      const px = offset + 1 + x * 3;
      // Draw gradient blue image with white border
      if (x < 4 || x >= width - 4 || y < 4 || y >= height - 4) {
        rawData[px] = 255;   // R
        rawData[px+1] = 255; // G
        rawData[px+2] = 255; // B
      } else {
        rawData[px] = 30;    // R
        rawData[px+1] = 144; // G
        rawData[px+2] = 255; // B
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(8 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const crc = crc32(buf.subarray(4, 8 + len));
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

// CRC32 implementation
function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ ((crc & 1) ? 0xEDB88320 : 0);
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

const pngBuffer = createValidPNG(400, 300);
const base64Png = 'data:image/png;base64,' + pngBuffer.toString('base64');
console.log('PNG Data URL Length:', base64Png.length);
console.log('Valid PNG Data URL:', base64Png.slice(0, 100) + '...');

fs.writeFileSync('png_proof.txt', base64Png);
