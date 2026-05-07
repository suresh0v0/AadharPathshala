const fs = require('fs');
const content = fs.readFileSync('./src/App.tsx', 'utf-8');
const start = content.indexOf('const AITutor = () => {');
console.log("Start found:", start !== -1);
if(start !== -1) {
    let depth = 0;
    for(let i=start; i<content.length; i++) {
        const char = content[i];
        if (char === '{') depth++;
        if (char === '}') {
            depth--;
            if (depth === 0) {
               console.log("AITutor ends at:", i, content.slice(i-40, i+20));
               break;
            }
        }
    }
    console.log("Depth at end of file:", depth);
}
