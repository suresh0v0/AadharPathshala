const fs = require('fs');
let content = fs.readFileSync('./src/App.tsx', 'utf-8');

// 1. Changing 'AITutor' fixed container's padding
content = content.replace(/className="fixed inset-0 pt-20 pb-\[76px\] bg-\[#F8FAFC\] z-10 flex flex-col items-center animate-fade-up overflow-y-auto"/g, 
'className="fixed inset-0 pt-0 pb-0 bg-[#F8FAFC] z-10 flex flex-col items-center animate-fade-up overflow-y-auto"');
content = content.replace(/className="fixed inset-0 pt-20 pb-\[76px\] bg-\[#F8FAFC\] z-10 flex flex-col items-center animate-fade-up"/g, 
'className="fixed inset-0 pt-0 pb-0 bg-[#F8FAFC] z-10 flex flex-col items-center animate-fade-up"');

// 2. Change the order of AI Provider buttons in 'selection'
const subashRe = /\{\/\* 4\. SUBASH Card \*\/\s*\}[\s\S]*?(?=\{\/\*|$)/;
const subashMatch = content.match(subashRe);
const subashBlock = subashMatch ? subashMatch[0] : '';
const cContent = content.replace(subashRe, '');

const lilaRe = /\{\/\* 2\. LILA Card \*\/\s*\}[\s\S]*?(?=\{\/\*|$)/;
const lilaMatch = cContent.match(lilaRe);
const lilaBlock = lilaMatch ? lilaMatch[0] : '';
const cContent2 = cContent.replace(lilaRe, '');

const gyanuRe = /\{\/\* 1\. GYANU \(Gemini\) \*\/\s*\}[\s\S]*?(?=\{\/\*|$)/;
const gyanuMatch = cContent2.match(gyanuRe);
const gyanuBlock = gyanuMatch ? gyanuMatch[0] : '';
const cContent3 = cContent2.replace(gyanuRe, '');

const misoRe = /\{\/\* 3\. ACHAR Card \*\/\s*\}[\s\S]*?(?=<\/div>\s*<\/div>\s*<\/div>\s*\);)/;
const misoMatch = cContent3.match(misoRe);
const misoBlock = misoMatch ? misoMatch[0] : '';
const cContent4 = cContent3.replace(misoRe, '');

// Reconstruct
const replacementGrid = subashBlock + lilaBlock + gyanuBlock + misoBlock;
content = content.replace(/<div className="grid grid-cols-1 md:grid-cols-2 gap-4">[\s\S]*?(?=<\/div>\s*<\/div>\s*<\/div>\s*\);)/, '<div className="grid grid-cols-1 md:grid-cols-2 gap-4">\n' + replacementGrid);

// 3. Update markdown colors
content = content.replace(
`h1: ({node, ...props}) => <h1 className="text-3xl font-black text-rose-500 uppercase tracking-tighter mt-6 mb-2" {...props} />,
                                            h2: ({node, ...props}) => <h2 className="text-2xl font-black text-blue uppercase tracking-tighter mt-5 mb-2" {...props} />,
                                            h3: ({node, ...props}) => <h3 className="text-xl font-black text-emerald-500 uppercase tracking-tight mt-4 mb-2" {...props} />,
                                            h4: ({node, ...props}) => <h4 className="text-lg font-black text-amber-500 uppercase tracking-tight mt-3 mb-1" {...props} />,`,
`h1: ({node, ...props}) => <h1 className={cn("text-3xl font-black uppercase tracking-tighter mt-6 mb-2", activeTutor === 'gyanu' ? 'text-indigo-600' : activeTutor === 'lila' ? 'text-purple-600' : activeTutor === 'subash' ? 'text-orange-600' : 'text-emerald-600')} {...props} />,
                                            h2: ({node, ...props}) => <h2 className={cn("text-2xl font-black uppercase tracking-tighter mt-5 mb-2", activeTutor === 'gyanu' ? 'text-indigo-500' : activeTutor === 'lila' ? 'text-pink-500' : activeTutor === 'subash' ? 'text-amber-500' : 'text-teal-500')} {...props} />,
                                            h3: ({node, ...props}) => <h3 className={cn("text-xl font-black uppercase tracking-tight mt-4 mb-2", activeTutor === 'gyanu' ? 'text-blue-500' : activeTutor === 'lila' ? 'text-rose-500' : activeTutor === 'subash' ? 'text-yellow-600' : 'text-green-500')} {...props} />,
                                            h4: ({node, ...props}) => <h4 className={cn("text-lg font-black uppercase tracking-tight mt-3 mb-1", activeTutor === 'gyanu' ? 'text-blue-400' : activeTutor === 'lila' ? 'text-rose-400' : activeTutor === 'subash' ? 'text-yellow-500' : 'text-green-400')} {...props} />,'`
);

// 4. Emojis and identity
content = content.replace(
`GROUNDING: You are an expert teacher in the Nepal Class 10 Curriculum. All answers must strictly follow standard Nepali educational guidelines (CDC Nepal).\`;`,
`GROUNDING: You are an expert teacher in the Nepal Class 10 Curriculum. All answers must strictly follow standard Nepali educational guidelines (CDC Nepal).
5. EMOJIS: Use relevant emojis generously in your responses (e.g. ⭐🦠🌺🏵️🏞️🏜️🔥).\`;`
);

// 5. Default tutor
content = content.replace(/useState\<'gyanu' \| 'lila' \| 'subash' \| 'miso'\>\('gyanu'\)/, "useState<'gyanu' | 'lila' | 'subash' | 'miso'>('subash')");

// 6. Fix "Opp!"
content = content.replace(/let displayMsg = \`Opp! Something went wrong: \${errMsg}\`;/g, "let displayMsg = `Oops! Something went wrong: ${errMsg}`;");
content = content.replace(/Opp! /g, "Oops! ");

fs.writeFileSync('./src/App.tsx', content);
console.log("App.tsx modified via script");
