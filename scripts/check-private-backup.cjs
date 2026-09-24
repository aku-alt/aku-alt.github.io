// The input stays outside the public repository. Only aggregate validation is printed.
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto'),vm=require('node:vm');
const Core=require('../src/workout-core.js'),Storage=require('../src/storage.js');
if(!process.argv[2])throw Error('Usage: node scripts/check-private-backup.cjs /absolute/private/backup.json');
const bytes=fs.readFileSync(process.argv[2]),payload=JSON.parse(bytes),original=JSON.stringify(payload.data),data=Core.migrate(payload.data);
assert.equal(JSON.stringify(payload.data),original);assert.deepEqual(Core.migrate(data),data);
for(const [day,log] of Object.entries(payload.data.logs)) {
 assert.equal(data.logs[day].exercises.length,log.exercises.length);
 for(const [i,ex] of log.exercises.entries())for(const [j,set] of ex.sets.entries())for(const [field,value] of Object.entries(set))assert.deepEqual(data.logs[day].exercises[i].sets[j][field],value);
}
for(const field of Object.keys(payload.data))if(!['logs','plans','rotationQueue'].includes(field))assert.deepEqual(data[field],payload.data[field]);
const source=fs.readFileSync('src/app.js','utf8');const app={__toESM:x=>x,require_jsx_runtime:()=>({}),window:{storage:{get:async()=>null,set:async()=>{}}},WorkoutCore:Core,WorkoutStorage:Storage};vm.createContext(app);vm.runInContext(source.slice(0,source.indexOf('  var BBBoundary')),app);
const stats=app.computeStats(data,'2026-09-24');assert.ok(Number.isFinite(stats.xp));assert.ok(Number.isFinite(app.xpInWindow(data,'2026-01-01','2026-09-24')));
for(const split of Object.keys(data.plans)) {
 const run=Core.prepare(data,'2026-09-25',split,'replace',Date.now());if(!run.logs['2026-09-25'].exercises.length)continue;
 run.logs['2026-09-25'].exercises[0].sets[0].done=true;
 const finished=Core.finish(run,'2026-09-25');assert.equal(finished.logs['2026-09-25'].split,split);assert.deepEqual(finished.logs['2026-09-24'],data.logs['2026-09-24']);
 const comparison=Core.comparison(finished,'2026-09-25');assert.ok(Number.isFinite(comparison.vol));
}
assert.equal(fs.readFileSync(process.argv[2]).compare(bytes),0);
console.log(JSON.stringify({validated:true,days:Object.keys(data.logs).length,routines:Object.keys(data.plans).length,photos:Object.keys(payload.photos||{}).length,legacyReviewGroups:data.migrationWarnings.length,originalUnchanged:true,sha256:crypto.createHash('sha256').update(bytes).digest('hex')},null,2));
