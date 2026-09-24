const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const Core=require('../src/workout-core.js'),Storage=require('../src/storage.js');
const source=fs.readFileSync(require.resolve('../src/app.js'),'utf8');
function appRules(){const c={__toESM:x=>x,require_jsx_runtime:()=>({}),window:{storage:{get:async()=>null,set:async()=>{}}},WorkoutCore:Core,WorkoutStorage:Storage};vm.createContext(c);vm.runInContext(source.slice(0,source.indexOf('  var BBBoundary')),c);return c;}
test('real app stats exclude unloaded/planned PRs and retain archived work',()=>{
 const app=appRules();let data=Core.migrate(app.emptyData());data=Core.prepare(data,'2026-09-24','PUSH','replace',1000);
 let stats=app.computeStats(data,'2026-09-24');assert.equal(stats.totalSets,0);assert.equal(stats.gymCount,0);assert.equal(Object.keys(stats.prMap).length,0);
 data.logs['2026-09-24'].exercises[0].sets[0].done=true;data=Core.finish(data,'2026-09-24',100000);
 data=Core.prepare(data,'2026-09-24','PULL','replace',200000);data.logs['2026-09-24'].exercises[0].sets[0].done=true;
 stats=app.computeStats(data,'2026-09-24');assert.equal(stats.totalSets,2);assert.equal(stats.gymCount,1);assert.equal(Object.keys(stats.prMap).length,2);
});
test('legacy set credits preserve past XP without inventing performance',()=>{
 const app=appRules(),raw=app.emptyData();raw.logs['2026-09-24']={exercises:[{name:'Uncertain',sets:[{kg:20,reps:8}]}]};
 const data=Core.migrate(raw),stats=app.computeStats(data,'2026-09-24');assert.equal(stats.totalSets,0);assert.equal(stats.xp,app.XP_PER_SET);assert.equal(app.xpInWindow(data,'2026-09-24','2026-09-24'),app.XP_PER_SET);
});
test('current and original totals are deliberately separate; no personal seeds run on load or import',()=>{
 const controller=source.slice(source.indexOf('  function WorkoutStreak()'));
 assert.doesNotMatch(controller,/applySeeds\(|applySeed\(|reconcile\(/);
 assert.match(source,/splitName: selLog.workoutName/);assert.match(source,/onRenameWorkout: wsRenameWorkout/);assert.match(source,/lastFor: lastTimeFor/);
});
module.exports={appRules};
