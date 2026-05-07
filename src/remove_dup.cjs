const fs = require('fs');
const content = fs.readFileSync('./src/App.tsx', 'utf-8');
const lines = content.split('\n');

const newLines = [];
let skip = false;

for(let i = 0; i < lines.length; i++) {
    if (i === 1291) { // 1292 is index 1291
        skip = true;
    }
    if (i === 1515) { // 1516 is index 1515
        skip = false;
        continue;
    }
    if (!skip) {
        newLines.push(lines[i]);
    }
}

fs.writeFileSync('./src/App.tsx', newLines.join('\n'));
console.log("Deleted duplicated block");
