const fs = require('fs');
const buffer = fs.readFileSync('c:\\Users\\User\\Documents\\code\\ads-performance\\fontes\\lkd-nov-2025.csv');
// Try to detect if it's utf16le (has BOM FF FE)
let content;
if (buffer[0] === 0xFF && buffer[1] === 0xFE) {
    content = buffer.toString('utf16le');
} else {
    content = buffer.toString('utf8');
}

const lines = content.split(/\r?\n/);
console.log('Detected encoding length:', content.length);

const headerIndex = lines.findIndex(l => l.includes('Impressions') && l.includes('Spend'));
console.log('Header Row Index:', headerIndex);
if (headerIndex !== -1) {
    console.log('Header Row:', lines[headerIndex]);
    console.log('Sample Data:', lines[headerIndex + 1]);
} else {
    console.log('Could not find header with Impressions and Spend');
    console.log('Line 5:', lines[5]);
}
