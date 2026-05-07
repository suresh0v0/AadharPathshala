const fs = require('fs');
const content = fs.readFileSync('./src/App.tsx', 'utf-8');

let depth = 0;
let inString = false;
let stringChar = '';

for(let i=0; i<content.length; i++) {
    const char = content[i];
    if(char === '{') depth++;
    if(char === '}') depth--;
}
console.log('Final depth:', depth);
