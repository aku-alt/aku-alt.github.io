// Synthetic, non-personal preview fixture. Never reads a user's backup.
const fs=require('node:fs'),vm=require('node:vm'),Core=require('../src/workout-core.js'),Storage=require('../src/storage.js');
const source=fs.readFileSync('src/app.js','utf8'),app={__toESM:x=>x,require_jsx_runtime:()=>({}),window:{storage:{get:async()=>null,set:async()=>{}}},WorkoutCore:Core,WorkoutStorage:Storage};vm.createContext(app);vm.runInContext(source.slice(0,source.indexOf('  var BBBoundary')),app);
let data=Core.migrate(app.emptyData());data.createdAt='2026-09-20';data.recapSeen='2026-09-14';
for(const [date,split,kg] of [['2026-09-20','PUSH',40],['2026-09-22','LEGS',60]]) {
 data=Core.prepare(data,date,split,'replace',Date.parse(date+'T08:00:00Z'));
 data.logs[date].exercises=data.logs[date].exercises.slice(0,1);data.logs[date].exercises[0].sets=data.logs[date].exercises[0].sets.slice(0,3).map(()=>({kg,reps:8,done:true}));
 data=Core.finish(data,date,Date.parse(date+'T08:45:00Z'));
}
data.rotationQueue=['LEGS','PUSH','PULL'];
fs.writeFileSync('tests/demo-backup.json',JSON.stringify({app:'workout-streak',version:2,data,photos:{}}));
console.log('Created synthetic demo data (no personal records).');
