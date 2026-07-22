const fs = require('fs');

const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="100%" height="100%" fill="#f8fafc"/><rect x="30" y="30" width="540" height="340" rx="16" fill="rgb(255,255,255)" stroke="#e2e8f0" stroke-width="2"/><circle cx="300" cy="130" r="50" fill="#dbeafe"/><path d="M280 115 L300 95 L320 115 L312 115 L312 140 L288 140 L288 115 Z" fill="#3b82f6"/><rect x="280" y="148" width="40" height="4" rx="2" fill="#93c5fd"/><rect x="160" y="200" width="280" height="12" rx="4" fill="#e2e8f0"/><rect x="190" y="224" width="220" height="10" rx="4" fill="#f1f5f9"/><rect x="210" y="246" width="180" height="10" rx="4" fill="#f1f5f9"/><text x="300" y="300" font-family="sans-serif" font-size="18" font-weight="bold" fill="#1e293b" text-anchor="middle">Bukti Lampiran Terverifikasi</text><text x="300" y="325" font-family="sans-serif" font-size="13" fill="#64748b" text-anchor="middle">SIKELAS Akademik Paramadina</text><circle cx="300" cy="365" r="12" fill="#22c55e"/><path d="M294 365 L298 369 L306 361" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const cleanB64 = Buffer.from(svg).toString('base64').replace(/[\r\n\s]+/g, '');
const dataUrl = 'data:image/svg+xml;base64,' + cleanB64;

console.log('Clean Base64 string length:', cleanB64.length);
console.log('Contains newline?', /[\r\n]/.test(cleanB64));
console.log('Data URL:', dataUrl);
