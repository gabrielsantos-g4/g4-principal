const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\User\\Documents\\code\\ads-performance\\fontes\\lkd-nov-2025.csv', 'utf16le'); // trying utf16le based on previous hint
const lines = content.split('\n');
console.log('Total lines:', lines.length);
console.log('--- First 10 lines ---');
lines.slice(0, 10).forEach((line, i) => console.log(`${i}: ${line}`));
console.log('--- Search for headers ---');
const headerLine = lines.find(l => l.includes('Campaign Name') || l.includes('Campaign name') || l.includes('Campaign'));
console.log('Header Candidate:', headerLine);
