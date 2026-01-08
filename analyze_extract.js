
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'fontes', 'extract.json');
const rawData = fs.readFileSync(filePath, 'utf8');
const jsonData = JSON.parse(rawData);

const csvContent = jsonData[0].csv_content;
const rows = csvContent.split('\n');

let headerIndex = -1;
for (let i = 0; i < 10; i++) {
    if (rows[i] && rows[i].toLowerCase().includes('start date')) {
        headerIndex = i;
        break;
    }
}

if (headerIndex === -1) {
    console.error('Could not find headers');
    process.exit(1);
}

const headerRow = rows[headerIndex].split('\t').map(h => h.trim());
console.log('Headers found:', headerRow);

const dateIndex = headerRow.findIndex(h => h.toLowerCase().includes('start date'));
if (dateIndex === -1) {
    console.error('No date column');
    process.exit(1);
}

const monthlySums = {};

for (let i = headerIndex + 1; i < rows.length; i++) {
    const line = rows[i];
    if (!line || line.trim() === '') continue;
    const cols = line.split('\t');

    if (!cols[dateIndex]) continue;

    const dateParts = cols[dateIndex].split('/');
    if (dateParts.length !== 3) continue;
    const month = dateParts[0].padStart(2, '0');
    const year = dateParts[2];
    const key = `${year}-${month}`;

    if (!monthlySums[key]) monthlySums[key] = {};

    cols.forEach((val, idx) => {
        const header = headerRow[idx] || `Col_${idx}`;
        let numVal = 0;
        if (val) {
            const clean = val.replace(/["$,]/g, '');
            if (!isNaN(parseFloat(clean))) {
                numVal = parseFloat(clean);
            }
        }
        monthlySums[key][header] = (monthlySums[key][header] || 0) + numVal;
    });
}

console.log('Fingerprint Analysis (June 2025):');
const targetMonth = '2025-06';
if (monthlySums[targetMonth]) {
    Object.entries(monthlySums[targetMonth]).forEach(([k, v]) => {
        // Broad range to catch anything small
        if (v > 10 && v < 1000) {
            console.log(`[MATCH CANDIDATE] ${k}: ${v.toFixed(2)}`);
        }
    });
    // Print Spend explicitly
    console.log(`Explicit Total Spent for June: ${monthlySums[targetMonth]['Total Spent']}`);
} else {
    console.log('June 2025 not found');
}
