import {spawn} from "node:child_process";
import {mkdtemp,rm} from "node:fs/promises";
import os from "node:os";import path from "node:path";
const dir=await mkdtemp(path.join(os.tmpdir(),"oneplan-test-"));const port=32187;
const child=spawn(process.execPath,["server.js"],{cwd:new URL("..",import.meta.url).pathname,env:{...process.env,PORT:String(port),STATE_FILE:path.join(dir,"state.json"),STATE_BACKUP_DIR:path.join(dir,"backups"),STATE_TOKEN:"test-token"},stdio:["ignore","pipe","pipe"]});
const base=`http://127.0.0.1:${port}`;const headers={"X-State-Token":"test-token","Content-Type":"application/json"};
async function wait(){for(let i=0;i<40;i++){try{const r=await fetch(base+"/api/health");if(r.ok)return;}catch{}await new Promise(r=>setTimeout(r,100));}throw new Error("server timeout");}
try{
 await wait();
 let r=await fetch(base+"/api/state",{headers});let p=await r.json();if(!r.ok||p.exists)throw new Error("empty state check failed");
 const state={settings:{},milestones:[],stores:[{id:"S1"}],projects:[]};
 r=await fetch(base+"/api/state",{method:"PUT",headers,body:JSON.stringify({state,baseRevision:0,clientId:"test",savedBy:"test"})});p=await r.json();if(!r.ok||p.meta.revision!==1)throw new Error("first save failed");
 r=await fetch(base+"/api/state",{headers});p=await r.json();if(!r.ok||!p.exists||p.state.stores.length!==1)throw new Error("readback failed");
 r=await fetch(base+"/api/state",{method:"PUT",headers,body:JSON.stringify({state,baseRevision:0,clientId:"stale",savedBy:"test"})});if(r.status!==409)throw new Error("conflict protection failed");
 r=await fetch(base+"/api/state",{method:"PUT",headers,body:JSON.stringify({state,baseRevision:0,force:true,clientId:"force",savedBy:"test"})});p=await r.json();if(!r.ok||p.meta.revision!==2)throw new Error("force save failed");
 console.log("Smoke test passed.");
}finally{child.kill("SIGTERM");await rm(dir,{recursive:true,force:true});}
