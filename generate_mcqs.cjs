const fs = require('fs');

const subjects = [
  'English', 'नेपाली', 'Maths', 'Science', 'सामाजिक', 'Optional Maths', 'Account', 'Computer'
];

let mcqsObjStr = "const STATIC_MCQS: Record<string, any[]> = {\n";

subjects.forEach(sub => {
  mcqsObjStr += `    '${sub}': [{\n        setName: 'MCQ SET 1',\n        questions: [\n`;
  for(let i=1; i<=30; i++) {
    mcqsObjStr += `            { q: "Sample Question ${i} for ${sub}?", a: "Option A", b: "Option B", c: "Option C", d: "Option D", correct: "a", explanation: "This is the explanation for ${sub}." }${i===30 ? '' : ','}\n`;
  }
  mcqsObjStr += `        ]\n    }]${sub === 'Computer' ? '' : ','}\n`;
});
mcqsObjStr += "};\n";

const content = fs.readFileSync('src/App.tsx', 'utf8');
const newContent = content.replace(/const STATIC_MCQS: Record<string, any\[\]> = \{[\s\S]*?\};\n(?=\/\/ ════════════════════════════════════════════)/g, mcqsObjStr);
fs.writeFileSync('src/App.tsx', newContent);
console.log("Updated MCQs");
