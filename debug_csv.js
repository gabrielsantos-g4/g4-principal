const fs = require('fs');
const Papa = require('papaparse');

const content = fs.readFileSync('c:\\Users\\User\\Documents\\code\\ads-performance\\fontes\\lkd-nov-2025.csv', 'utf8');

Papa.parse(content, {
    header: false,
    skipEmptyLines: true,
    complete: (results) => {
        const rows = results.data;
        // Find header row
        const headerIndex = rows.findIndex(row => row.some(c => c.includes('Impressions') || c.includes('Spend')));

        if (headerIndex === -1) {
            console.log('Header not found');
            return;
        }

        const headers = rows[headerIndex];
        console.log('--- HEADERS FOUND ---');
        headers.forEach((h, i) => console.log(`${i}: ${h}`));

        console.log('\n--- FIRST DATA ROW ---');
        const firstRow = rows[headerIndex + 1];
        firstRow.forEach((val, i) => console.log(`${headers[i]}: "${val}"`));
    }
});
