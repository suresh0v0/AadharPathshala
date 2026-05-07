const fs = require('fs');
let content = fs.readFileSync('./src/App.tsx', 'utf-8');

// Replace IDs
content = content.replace(/momo/g, 'lila');
content = content.replace(/mango/g, 'subash');
content = content.replace(/aachar/g, 'miso');

// Replace uppercase
content = content.replace(/MOMO/g, 'LILA');
content = content.replace(/MANGO/g, 'SUBASH');
content = content.replace(/AACHAR/g, 'MISO');

fs.writeFileSync('./src/App.tsx', content);
console.log("Replaced names properly");
