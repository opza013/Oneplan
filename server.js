import http from "node:http";
import { promises as fs, createReadStream } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname=path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR=path.join(__dirname,"public");
const PORT=Number(process.env.PORT||3000);
const STATE_FILE=process.env.STATE_FILE||path.join(__dirname,"data","state.json");
const BACKUP_DIR=process.env.STATE_BACKUP_DIR||path.join(path.dirname(STATE_FILE),"backups");
const STATE_TOKEN=String(process.env.STATE_TOKEN||"");
const MAX_BODY=25*1024*1024;
const MAX_BACKUPS=Math.max(3,Number(process.env.MAX_STATE_BACKUPS||20));
let writeChain=Promise.resolve();

const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".ico":"image/x-icon",".webmanifest":"application/manifest+json"};
function json(res,status,data,headers={}){res.writeHead(status,{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store",...headers});res.end(JSON.stringify(data));}
function secureHeaders(){return {"X-Content-Type-Options":"nosniff","X-Frame-Options":"SAMEORIGIN","Referrer-Policy":"same-origin","Permissions-Policy":"geolocation=(), camera=(), microphone=()"};}
function safeEqual(a,b){const aa=Buffer.from(String(a));const bb=Buffer.from(String(b));return aa.length===bb.length&&crypto.timingSafeEqual(aa,bb);}
function authorized(req){if(!STATE_TOKEN)return true;return safeEqual(req.headers["x-state-token"]||"",STATE_TOKEN);}
function checksum(state){return crypto.createHash("sha256").update(JSON.stringify(state)).digest("hex");}
function validateState(state){
  if(!state||typeof state!=="object"||Array.isArray(state))return "State must be an object.";
  if(!state.settings||typeof state.settings!=="object")return "settings object is missing.";
  if(!Array.isArray(state.milestones))return "milestones array is missing.";
  if(!Array.isArray(state.stores))return "stores array is missing.";
  if(!Array.isArray(state.projects))return "projects array is missing.";
  if(state.stores.length>20000)return "stores exceeds the allowed limit.";
  if(state.projects.length>20000)return "projects exceeds the allowed limit.";
  return "";
}
async function ensureDirs(){await fs.mkdir(path.dirname(STATE_FILE),{recursive:true});await fs.mkdir(BACKUP_DIR,{recursive:true});}
async function readRecord(){
  try{
    const raw=await fs.readFile(STATE_FILE,"utf8"); const parsed=JSON.parse(raw);
    if(parsed&&parsed.state&&parsed.meta)return parsed;
    const err=validateState(parsed); if(err)throw new Error("Invalid legacy state: "+err);
    return {meta:{schemaVersion:1,revision:1,savedAt:null,savedBy:"legacy",clientId:"legacy",checksum:checksum(parsed)},state:parsed};
  }catch(e){if(e.code==="ENOENT")return null;throw e;}
}
async function atomicWrite(file,data){
  const temp=file+"."+process.pid+"."+Date.now()+".tmp";
  await fs.writeFile(temp,data,{encoding:"utf8",mode:0o600});
  await fs.rename(temp,file);
}
function backupName(meta){return `state-r${String(meta?.revision||0).padStart(6,"0")}-${new Date().toISOString().replace(/[:.]/g,"-")}.json`;}
async function backupCurrent(record){
  if(!record)return;
  await atomicWrite(path.join(BACKUP_DIR,backupName(record.meta)),JSON.stringify(record,null,2));
  const files=(await fs.readdir(BACKUP_DIR)).filter(x=>x.endsWith(".json")).sort().reverse();
  await Promise.all(files.slice(MAX_BACKUPS).map(f=>fs.unlink(path.join(BACKUP_DIR,f)).catch(()=>{})));
}
async function readBody(req){
  return await new Promise((resolve,reject)=>{let size=0;const chunks=[];req.on("data",c=>{size+=c.length;if(size>MAX_BODY){reject(Object.assign(new Error("Payload too large"),{status:413}));req.destroy();return;}chunks.push(c);});req.on("end",()=>resolve(Buffer.concat(chunks).toString("utf8")));req.on("error",reject);});
}
async function saveRecord(payload){
  return writeChain=writeChain.catch(()=>{}).then(async()=>{
    await ensureDirs(); const current=await readRecord();
    const currentRevision=current?.meta?.revision||0;
    const requested=payload.baseRevision==null?null:Number(payload.baseRevision);
    if(!payload.force && current && requested!==currentRevision){return {conflict:true,currentMeta:current.meta};}
    const state=payload.state; const err=validateState(state); if(err)throw Object.assign(new Error(err),{status:400});
    await backupCurrent(current);
    const meta={schemaVersion:2,revision:currentRevision+1,savedAt:new Date().toISOString(),savedBy:String(payload.savedBy||"OnePlan user").slice(0,120),clientId:String(payload.clientId||"unknown").slice(0,160),checksum:checksum(state)};
    const record={meta,state}; await atomicWrite(STATE_FILE,JSON.stringify(record,null,2)); return {record};
  });
}
async function serveStatic(req,res,urlPath){
  let rel=decodeURIComponent(urlPath==="/"?"/index.html":urlPath);
  const resolved=path.resolve(PUBLIC_DIR,"."+rel);
  if(!resolved.startsWith(path.resolve(PUBLIC_DIR)+path.sep)&&resolved!==path.join(PUBLIC_DIR,"index.html")){json(res,403,{error:"Forbidden"});return;}
  try{
    const stat=await fs.stat(resolved); if(!stat.isFile())throw Object.assign(new Error("Not file"),{code:"ENOENT"});
    const ext=path.extname(resolved).toLowerCase();
    res.writeHead(200,{"Content-Type":mime[ext]||"application/octet-stream","Cache-Control":ext===".html"?"no-cache":"public, max-age=3600",...secureHeaders()});
    createReadStream(resolved).pipe(res);
  }catch(e){
    if(e.code==="ENOENT"&&!path.extname(urlPath)){return serveStatic(req,res,"/index.html");}
    json(res,404,{error:"Not found"});
  }
}
async function handler(req,res){
  const u=new URL(req.url,"http://localhost");
  if(u.pathname.startsWith("/api/")){
    Object.entries(secureHeaders()).forEach(([k,v])=>res.setHeader(k,v));
    if(u.pathname==="/api/health"&&req.method==="GET")return json(res,200,{ok:true,service:"oneplan-cloud-state",time:new Date().toISOString(),stateFile:path.basename(STATE_FILE)});
    if(!authorized(req))return json(res,401,{error:"Invalid or missing state token."});
    if(u.pathname==="/api/state"&&req.method==="GET"){
      try{const record=await readRecord();return json(res,200,{ok:true,exists:Boolean(record),meta:record?.meta||{revision:0},state:record?.state||null});}catch(e){console.error(e);return json(res,500,{error:"State read failed."});}
    }
    if(u.pathname==="/api/state/meta"&&req.method==="GET"){
      try{const record=await readRecord();return json(res,200,{ok:true,exists:Boolean(record),meta:record?.meta||{revision:0}});}catch(e){return json(res,500,{error:"State metadata read failed."});}
    }
    if(u.pathname==="/api/state"&&req.method==="PUT"){
      try{const body=JSON.parse(await readBody(req)||"{}");const result=await saveRecord(body);if(result.conflict)return json(res,409,{error:"Revision conflict",currentMeta:result.currentMeta});return json(res,200,{ok:true,meta:result.record.meta});}
      catch(e){console.error(e);return json(res,e.status||400,{error:e.message||"State save failed."});}
    }
    if(u.pathname==="/api/state/export"&&req.method==="GET"){
      try{const record=await readRecord();if(!record)return json(res,404,{error:"No cloud state exists."});res.writeHead(200,{"Content-Type":"application/json; charset=utf-8","Content-Disposition":`attachment; filename="oneplan-cloud-state-r${record.meta.revision}.json"`,"Cache-Control":"no-store",...secureHeaders()});return res.end(JSON.stringify(record,null,2));}catch(e){return json(res,500,{error:"Export failed."});}
    }
    if(u.pathname==="/api/backups"&&req.method==="GET"){
      try{await ensureDirs();const files=(await fs.readdir(BACKUP_DIR)).filter(x=>x.endsWith(".json")).sort().reverse();return json(res,200,{ok:true,backups:files});}catch(e){return json(res,500,{error:"Backup list failed."});}
    }
    return json(res,404,{error:"API endpoint not found."});
  }
  return serveStatic(req,res,u.pathname);
}

await ensureDirs();
const server=http.createServer((req,res)=>{handler(req,res).catch(e=>{console.error(e);if(!res.headersSent)json(res,500,{error:"Internal server error."});else res.end();});});
server.listen(PORT,"0.0.0.0",()=>console.log(`OnePlan running on http://0.0.0.0:${PORT} | state=${STATE_FILE}`));
