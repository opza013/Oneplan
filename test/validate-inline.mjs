import fs from "node:fs";
import vm from "node:vm";
const html=fs.readFileSync(new URL("../public/index.html",import.meta.url),"utf8");
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(m=>m[1]).filter(x=>x.trim());
for(let i=0;i<scripts.length;i++){try{new vm.Script(scripts[i],{filename:`inline-${i+1}.js`});}catch(e){console.error(e);process.exit(1);}}
console.log(`Validated ${scripts.length} inline script block(s).`);
